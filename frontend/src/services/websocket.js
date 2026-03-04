import { wsManager } from './api'

class WebSocketService {
  constructor() {
    this.connections = new Map()
    this.subscribers = new Map()
    this.reconnectAttempts = new Map()
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
  }

  // Connect to WebSocket
  connect(url, options = {}) {
    const {
      onOpen,
      onMessage,
      onClose,
      onError,
      protocols = [],
      autoReconnect = true,
      heartbeat = true,
      heartbeatInterval = 30000
    } = options

    let reconnectTimer = null
    let heartbeatTimer = null

    const ws = new WebSocket(url, protocols)

    ws.onopen = (event) => {
      console.log(`WebSocket connected: ${url}`)
      this.reconnectAttempts.delete(url)
      
      // Start heartbeat
      if (heartbeat) {
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, heartbeatInterval)
      }

      onOpen?.(event)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle pong response
        if (data.type === 'pong') {
          return
        }

        // Notify subscribers
        const subscribers = this.subscribers.get(url) || []
        subscribers.forEach(callback => callback(data))

        onMessage?.(data)
      } catch (error) {
        onMessage?.(event.data)
      }
    }

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected: ${url}`)
      
      // Clear timers
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }

      // Attempt to reconnect
      if (autoReconnect) {
        const attempts = this.reconnectAttempts.get(url) || 0
        if (attempts < this.maxReconnectAttempts) {
          reconnectTimer = setTimeout(() => {
            console.log(`Reconnecting to ${url} (attempt ${attempts + 1})`)
            this.reconnectAttempts.set(url, attempts + 1)
            this.connect(url, options)
          }, this.reconnectDelay * Math.pow(2, attempts))
        }
      }

      onClose?.(event)
    }

    ws.onerror = (event) => {
      console.error(`WebSocket error: ${url}`, event)
      onError?.(event)
    }

    this.connections.set(url, {
      ws,
      options,
      reconnectTimer,
      heartbeatTimer
    })

    return ws
  }

  // Disconnect
  disconnect(url) {
    const connection = this.connections.get(url)
    if (connection) {
      const { ws, reconnectTimer, heartbeatTimer } = connection
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
      }
      
      ws.close()
      this.connections.delete(url)
      this.reconnectAttempts.delete(url)
      this.subscribers.delete(url)
    }
  }

  // Disconnect all
  disconnectAll() {
    this.connections.forEach((_, url) => this.disconnect(url))
  }

  // Send message
  send(url, data) {
    const connection = this.connections.get(url)
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(typeof data === 'string' ? data : JSON.stringify(data))
      return true
    }
    return false
  }

  // Subscribe to messages
  subscribe(url, callback) {
    if (!this.subscribers.has(url)) {
      this.subscribers.set(url, [])
    }
    this.subscribers.get(url).push(callback)
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(url) || []
      const index = subscribers.indexOf(callback)
      if (index !== -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  // Get connection status
  getStatus(url) {
    const connection = this.connections.get(url)
    if (!connection) return 'disconnected'
    
    switch (connection.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  }

  // Check if connected
  isConnected(url) {
    return this.getStatus(url) === 'connected'
  }

  // Get all connections
  getConnections() {
    const connections = {}
    this.connections.forEach((_, url) => {
      connections[url] = this.getStatus(url)
    })
    return connections
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService()

// Hook for using WebSocket
export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ws = webSocketService.connect(url, {
      ...options,
      onOpen: () => {
        setIsConnected(true)
        options.onOpen?.()
      },
      onMessage: (data) => {
        setLastMessage(data)
        options.onMessage?.(data)
      },
      onClose: () => {
        setIsConnected(false)
        options.onClose?.()
      },
      onError: (err) => {
        setError(err)
        options.onError?.(err)
      }
    })

    return () => {
      webSocketService.disconnect(url)
    }
  }, [url])

  const send = useCallback((data) => {
    return webSocketService.send(url, data)
  }, [url])

  const subscribe = useCallback((callback) => {
    return webSocketService.subscribe(url, callback)
  }, [url])

  return {
    isConnected,
    lastMessage,
    error,
    send,
    subscribe,
    status: webSocketService.getStatus(url)
  }
}

// WebSocket channels
export class WebSocketChannel {
  constructor(url, channel) {
    this.url = url
    this.channel = channel
    this.messageHandlers = new Map()
  }

  connect(options = {}) {
    return webSocketService.connect(this.url, {
      ...options,
      onMessage: (data) => {
        if (data.channel === this.channel) {
          const handlers = this.messageHandlers.get(data.type) || []
          handlers.forEach(handler => handler(data.data))
        }
        options.onMessage?.(data)
      }
    })
  }

  disconnect() {
    webSocketService.disconnect(this.url)
  }

  send(type, data) {
    return webSocketService.send(this.url, {
      channel: this.channel,
      type,
      data,
      timestamp: Date.now()
    })
  }

  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type).push(handler)
    
    return () => {
      const handlers = this.messageHandlers.get(type) || []
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  off(type, handler) {
    const handlers = this.messageHandlers.get(type) || []
    const index = handlers.indexOf(handler)
    if (index !== -1) {
      handlers.splice(index, 1)
    }
  }

  isConnected() {
    return webSocketService.isConnected(this.url)
  }

  getStatus() {
    return webSocketService.getStatus(this.url)
  }
}

// WebSocket room (for chat/multi-user)
export class WebSocketRoom extends WebSocketChannel {
  constructor(url, roomId) {
    super(url, `room:${roomId}`)
    this.roomId = roomId
    this.users = new Set()
  }

  join(user) {
    this.send('join', { user })
    this.users.add(user)
  }

  leave(user) {
    this.send('leave', { user })
    this.users.delete(user)
  }

  message(content) {
    this.send('message', {
      content,
      timestamp: Date.now()
    })
  }

  getUsers() {
    return Array.from(this.users)
  }
}

export default webSocketService