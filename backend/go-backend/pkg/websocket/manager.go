package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// ─── Constants ───────────────────────────────────────────────────────────────

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096 // 4 KB inbound limit
	sendBufSize    = 256
)

// ─── Types ───────────────────────────────────────────────────────────────────

// Message represents a structured WebSocket message.
type Message struct {
	Type    string      `json:"type"`
	TaskID  string      `json:"taskId,omitempty"`
	Payload interface{} `json:"payload,omitempty"`
}

// Client wraps a single WebSocket connection.
type Client struct {
	manager  *Manager
	conn     *websocket.Conn
	send     chan []byte
	tasks    map[string]bool // subscribed task IDs
	tasksMu  sync.RWMutex
	isClosed atomic.Bool
}

// Manager orchestrates all active WebSocket clients.
type Manager struct {
	clients    map[*Client]bool
	tasks      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
	mu         sync.RWMutex

	// Metrics
	totalConnections atomic.Int64
	activeClients    atomic.Int64
}

// ─── Upgrader ────────────────────────────────────────────────────────────────

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: restrict origins in production
	},
	HandshakeTimeout: 10 * time.Second,
}

// ─── Constructor ─────────────────────────────────────────────────────────────

// NewManager creates and returns a ready-to-run Manager.
func NewManager() *Manager {
	return &Manager{
		clients:    make(map[*Client]bool),
		tasks:      make(map[string]map[*Client]bool),
		register:   make(chan *Client, 64),
		unregister: make(chan *Client, 64),
		broadcast:  make(chan []byte, 256),
	}
}

// ─── Manager Lifecycle ───────────────────────────────────────────────────────

// Run is the main event loop; call via `go manager.Run()`.
func (m *Manager) Run() {
	cleanupTicker := time.NewTicker(5 * time.Minute)
	defer cleanupTicker.Stop()

	for {
		select {
		case client := <-m.register:
			m.mu.Lock()
			m.clients[client] = true
			m.mu.Unlock()
			m.activeClients.Add(1)
			m.totalConnections.Add(1)
			log.Printf("[ws] client connected  (active=%d total=%d)",
				m.activeClients.Load(), m.totalConnections.Load())

		case client := <-m.unregister:
			m.removeClient(client)

		case message := <-m.broadcast:
			m.mu.RLock()
			for client := range m.clients {
				select {
				case client.send <- message:
				default:
					go m.removeClientAsync(client)
				}
			}
			m.mu.RUnlock()

		case <-cleanupTicker.C:
			m.cleanupEmptyTasks()
		}
	}
}

// removeClient fully cleans up a client from the manager.
func (m *Manager) removeClient(client *Client) {
	if client.isClosed.Swap(true) {
		return // already removed
	}

	m.mu.Lock()
	if _, ok := m.clients[client]; ok {
		delete(m.clients, client)

		// Remove from all task subscriptions
		client.tasksMu.RLock()
		for taskID := range client.tasks {
			if subs, exists := m.tasks[taskID]; exists {
				delete(subs, client)
				if len(subs) == 0 {
					delete(m.tasks, taskID)
				}
			}
		}
		client.tasksMu.RUnlock()

		close(client.send)
		m.activeClients.Add(-1)
		log.Printf("[ws] client disconnected (active=%d)", m.activeClients.Load())
	}
	m.mu.Unlock()
}

// removeClientAsync schedules removal outside of a hot path.
func (m *Manager) removeClientAsync(client *Client) {
	select {
	case m.unregister <- client:
	default:
		// channel full; direct cleanup
		m.removeClient(client)
	}
}

// cleanupEmptyTasks removes task entries with no subscribers.
func (m *Manager) cleanupEmptyTasks() {
	m.mu.Lock()
	defer m.mu.Unlock()
	for taskID, subs := range m.tasks {
		if len(subs) == 0 {
			delete(m.tasks, taskID)
		}
	}
}

// ─── HTTP Handler ────────────────────────────────────────────────────────────

// HandleWebSocket upgrades an HTTP connection to WebSocket.
func (m *Manager) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[ws] upgrade failed: %v", err)
		return
	}

	client := &Client{
		manager: m,
		conn:    conn,
		send:    make(chan []byte, sendBufSize),
		tasks:   make(map[string]bool),
	}

	m.register <- client

	go client.writePump()
	go client.readPump()
}

// ─── Broadcasting ────────────────────────────────────────────────────────────

// BroadcastToTask sends a JSON message to all clients subscribed to a task.
func (m *Manager) BroadcastToTask(taskID string, message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("[ws] marshal error for task %s: %v", taskID, err)
		return
	}

	m.mu.RLock()
	subs, ok := m.tasks[taskID]
	if !ok || len(subs) == 0 {
		m.mu.RUnlock()
		return
	}

	// Copy subscriber list to avoid holding lock during send
	clients := make([]*Client, 0, len(subs))
	for c := range subs {
		clients = append(clients, c)
	}
	m.mu.RUnlock()

	for _, client := range clients {
		if client.isClosed.Load() {
			continue
		}
		select {
		case client.send <- data:
		default:
			log.Printf("[ws] send buffer full for task %s, dropping client", taskID)
			go m.removeClientAsync(client)
		}
	}
}

// BroadcastAll sends a JSON message to every connected client.
func (m *Manager) BroadcastAll(message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("[ws] broadcast marshal error: %v", err)
		return
	}

	select {
	case m.broadcast <- data:
	default:
		log.Printf("[ws] broadcast channel full, message dropped")
	}
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

// ActiveClients returns the current number of connected clients.
func (m *Manager) ActiveClients() int64 {
	return m.activeClients.Load()
}

// TotalConnections returns the lifetime count of connections.
func (m *Manager) TotalConnections() int64 {
	return m.totalConnections.Load()
}

// TaskSubscribers returns how many clients are watching a given task.
func (m *Manager) TaskSubscribers(taskID string) int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.tasks[taskID])
}

// ─── Client: readPump ────────────────────────────────────────────────────────

func (c *Client) readPump() {
	defer func() {
		c.manager.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	if err := c.conn.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		log.Printf("[ws] set read deadline error: %v", err)
		return
	}
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("[ws] unexpected close: %v", err)
			}
			return
		}

		var msg Message
		if err := json.Unmarshal(raw, &msg); err != nil {
			c.sendError("invalid JSON")
			continue
		}

		c.handleMessage(msg)
	}
}

// handleMessage processes inbound client messages.
func (c *Client) handleMessage(msg Message) {
	switch msg.Type {
	case "subscribe":
		if msg.TaskID == "" {
			c.sendError("taskId required for subscribe")
			return
		}
		c.subscribeTask(msg.TaskID)

	case "unsubscribe":
		if msg.TaskID == "" {
			c.sendError("taskId required for unsubscribe")
			return
		}
		c.unsubscribeTask(msg.TaskID)

	case "ping":
		c.sendJSON(Message{Type: "pong"})

	default:
		c.sendError(fmt.Sprintf("unknown message type: %s", msg.Type))
	}
}

// subscribeTask adds the client to a task's subscriber list.
func (c *Client) subscribeTask(taskID string) {
	c.tasksMu.Lock()
	c.tasks[taskID] = true
	c.tasksMu.Unlock()

	c.manager.mu.Lock()
	if c.manager.tasks[taskID] == nil {
		c.manager.tasks[taskID] = make(map[*Client]bool)
	}
	c.manager.tasks[taskID][c] = true
	c.manager.mu.Unlock()

	c.sendJSON(Message{Type: "subscribed", TaskID: taskID})
}

// unsubscribeTask removes the client from a task's subscriber list.
func (c *Client) unsubscribeTask(taskID string) {
	c.tasksMu.Lock()
	delete(c.tasks, taskID)
	c.tasksMu.Unlock()

	c.manager.mu.Lock()
	if subs, ok := c.manager.tasks[taskID]; ok {
		delete(subs, c)
		if len(subs) == 0 {
			delete(c.manager.tasks, taskID)
		}
	}
	c.manager.mu.Unlock()

	c.sendJSON(Message{Type: "unsubscribed", TaskID: taskID})
}

// ─── Client: writePump ───────────────────────────────────────────────────────

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if err := c.conn.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
				return
			}
			if !ok {
				// Channel closed; send close frame
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			if _, err := w.Write(message); err != nil {
				return
			}

			// Drain queued messages into the same frame for efficiency
			n := len(c.send)
			for i := 0; i < n; i++ {
				if _, err := w.Write([]byte("\n")); err != nil {
					break
				}
				if _, err := w.Write(<-c.send); err != nil {
					break
				}
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			if err := c.conn.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
				return
			}
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ─── Client: Helpers ─────────────────────────────────────────────────────────

func (c *Client) sendJSON(msg Message) {
	if c.isClosed.Load() {
		return
	}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	select {
	case c.send <- data:
	default:
		// buffer full
	}
}

func (c *Client) sendError(text string) {
	c.sendJSON(Message{Type: "error", Payload: text})
}
