'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketMessage, PresenceUser, EditOperation } from '@/types'

interface WebSocketContextValue {
  socket: WebSocket | null
  isConnected: boolean
  presenceUsers: PresenceUser[]
  sendMessage: (message: Omit<WebSocketMessage, 'timestamp'>) => void
  sendEdit: (edit: EditOperation) => void
  sendPresence: (presence: Partial<PresenceUser>) => void
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    try {
      // Use WebSocket URL based on environment
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/api/ws`
        : 'ws://localhost:8080'
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        reconnectAttempts.current = 0
        setSocket(ws)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setSocket(null)
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
    }
  }, [])

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'presence':
        if (message.payload.type === 'user_joined') {
          setPresenceUsers(prev => {
            const existing = prev.find(u => u.id === message.payload.user.id)
            if (existing) {
              return prev.map(u => u.id === message.payload.user.id ? message.payload.user : u)
            }
            return [...prev, message.payload.user]
          })
        } else if (message.payload.type === 'user_left') {
          setPresenceUsers(prev => prev.filter(u => u.id !== message.payload.userId))
        } else if (message.payload.type === 'user_updated') {
          setPresenceUsers(prev => prev.map(u => 
            u.id === message.payload.user.id ? { ...u, ...message.payload.user } : u
          ))
        } else if (message.payload.type === 'presence_list') {
          setPresenceUsers(message.payload.users)
        }
        break

      case 'chat':
        // Handle chat messages - could emit custom events or use callbacks
        window.dispatchEvent(new CustomEvent('websocket-chat', { detail: message.payload }))
        break

      case 'edit':
        // Handle edit operations
        window.dispatchEvent(new CustomEvent('websocket-edit', { detail: message.payload }))
        break

      case 'suggestion':
        // Handle agent suggestions
        window.dispatchEvent(new CustomEvent('websocket-suggestion', { detail: message.payload }))
        break

      case 'status':
        // Handle status updates
        window.dispatchEvent(new CustomEvent('websocket-status', { detail: message.payload }))
        break

      default:
        console.warn('Unknown WebSocket message type:', message.type)
    }
  }, [])

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date(),
      }
      socket.send(JSON.stringify(fullMessage))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [socket])

  const sendEdit = useCallback((edit: EditOperation) => {
    sendMessage({
      type: 'edit',
      payload: edit,
    })
  }, [sendMessage])

  const sendPresence = useCallback((presence: Partial<PresenceUser>) => {
    sendMessage({
      type: 'presence',
      payload: {
        type: 'user_updated',
        user: presence,
      },
    })
  }, [sendMessage])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [connect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [socket])

  const value: WebSocketContextValue = {
    socket,
    isConnected,
    presenceUsers,
    sendMessage,
    sendEdit,
    sendPresence,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// Custom hooks for specific WebSocket events
export function useWebSocketEvent<T = any>(
  eventType: 'chat' | 'edit' | 'suggestion' | 'status',
  callback: (data: T) => void
) {
  useEffect(() => {
    const eventName = `websocket-${eventType}`
    const handler = (event: CustomEvent<T>) => callback(event.detail)
    
    window.addEventListener(eventName, handler as EventListener)
    return () => window.removeEventListener(eventName, handler as EventListener)
  }, [eventType, callback])
}

export function usePresence() {
  const { presenceUsers, sendPresence } = useWebSocket()
  
  const updateCursor = useCallback((file: string, line: number, column: number) => {
    sendPresence({
      cursor: { file, line, column },
      status: 'online',
      lastSeen: new Date(),
    })
  }, [sendPresence])

  const updateStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    sendPresence({
      status,
      lastSeen: new Date(),
    })
  }, [sendPresence])

  return {
    presenceUsers,
    updateCursor,
    updateStatus,
  }
}