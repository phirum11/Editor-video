import { useState, useEffect, useCallback, useRef } from 'react'

export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  
  const ws = useRef(null)
  const reconnectTimeout = useRef()
  const pingInterval = useRef()
  const messageQueue = useRef([])

  const {
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeat = true,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onMessage,
    onError
  } = options

  // Connect WebSocket
  const connect = useCallback(() => {
    if (!url || ws.current?.readyState === WebSocket.OPEN) return

    setIsConnecting(true)
    setError(null)

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setReconnectAttempt(0)
        onOpen?.()

        // Send queued messages
        while (messageQueue.current.length > 0) {
          const message = messageQueue.current.shift()
          sendMessage(message)
        }

        // Start heartbeat
        if (heartbeat) {
          pingInterval.current = setInterval(() => {
            sendMessage({ type: 'ping' })
          }, heartbeatInterval)
        }
      }

      ws.current.onclose = (event) => {
        setIsConnected(false)
        setIsConnecting(false)
        onClose?.(event)

        // Clear heartbeat
        if (pingInterval.current) {
          clearInterval(pingInterval.current)
        }

        // Attempt reconnect
        if (reconnect && reconnectAttempt < maxReconnectAttempts) {
          reconnectTimeout.current = setTimeout(() => {
            setReconnectAttempt(prev => prev + 1)
            connect()
          }, reconnectInterval)
        }
      }

      ws.current.onerror = (event) => {
        setError(event)
        onError?.(event)
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          onMessage?.(data)

          // Handle pong response
          if (data.type === 'pong') {
            // Heartbeat response received
          }
        } catch (err) {
          // Handle non-JSON message
          setLastMessage(event.data)
          onMessage?.(event.data)
        }
      }
    } catch (err) {
      setError(err)
      setIsConnecting(false)
    }
  }, [url, reconnect, reconnectInterval, maxReconnectAttempts, reconnectAttempt, heartbeat, heartbeatInterval, onOpen, onClose, onMessage, onError])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }

    if (pingInterval.current) {
      clearInterval(pingInterval.current)
    }

    setIsConnected(false)
    setIsConnecting(false)
    messageQueue.current = []
  }, [])

  // Send message
  const sendMessage = useCallback((message) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      messageQueue.current.push(message)
      return false
    }

    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      ws.current.send(data)
      return true
    } catch (err) {
      setError(err)
      return false
    }
  }, [])

  // Auto connect
  useEffect(() => {
    if (url) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [url, connect, disconnect])

  // Reconnect on url change
  useEffect(() => {
    if (url && ws.current) {
      disconnect()
      connect()
    }
  }, [url, disconnect, connect])

  return {
    isConnected,
    isConnecting,
    lastMessage,
    error,
    reconnectAttempt,
    sendMessage,
    connect,
    disconnect
  }
}

// WebSocket channel
export const useWebSocketChannel = (url, channel) => {
  const ws = useWebSocket(url)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (ws.lastMessage?.channel === channel) {
      setMessages(prev => [...prev, ws.lastMessage])
    }
  }, [ws.lastMessage, channel])

  const sendToChannel = useCallback((type, data) => {
    ws.sendMessage({
      channel,
      type,
      data,
      timestamp: Date.now()
    })
  }, [ws, channel])

  return {
    ...ws,
    messages,
    sendToChannel,
    clearMessages: () => setMessages([])
  }
}

// WebSocket room
export const useWebSocketRoom = (url, room) => {
  const ws = useWebSocket(url)
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (ws.lastMessage?.room === room) {
      switch (ws.lastMessage.type) {
        case 'user_joined':
          setUsers(prev => [...prev, ws.lastMessage.user])
          break
        case 'user_left':
          setUsers(prev => prev.filter(u => u.id !== ws.lastMessage.user.id))
          break
        case 'message':
          setMessages(prev => [...prev, ws.lastMessage])
          break
      }
    }
  }, [ws.lastMessage, room])

  const joinRoom = useCallback(() => {
    ws.sendMessage({
      type: 'join_room',
      room
    })
  }, [ws, room])

  const leaveRoom = useCallback(() => {
    ws.sendMessage({
      type: 'leave_room',
      room
    })
  }, [ws, room])

  const sendToRoom = useCallback((type, data) => {
    ws.sendMessage({
      room,
      type,
      data,
      timestamp: Date.now()
    })
  }, [ws, room])

  return {
    ...ws,
    users,
    messages,
    joinRoom,
    leaveRoom,
    sendToRoom,
    clearMessages: () => setMessages([])
  }
}

// WebSocket with authentication
export const useAuthenticatedWebSocket = (url, token) => {
  const authenticatedUrl = token ? `${url}?token=${token}` : url
  return useWebSocket(authenticatedUrl)
}

// WebSocket with reconnection
export const useReconnectingWebSocket = (url, options = {}) => {
  return useWebSocket(url, {
    reconnect: true,
    reconnectInterval: options.reconnectInterval || 3000,
    maxReconnectAttempts: options.maxReconnectAttempts || 10,
    ...options
  })
}

// WebSocket with heartbeat
export const useHeartbeatWebSocket = (url, options = {}) => {
  const ws = useWebSocket(url, {
    heartbeat: true,
    heartbeatInterval: options.heartbeatInterval || 30000,
    ...options
  })

  return ws
}