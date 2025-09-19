/**
 * Thor.dev WebSocket Server
 * Real-time collaboration server supporting:
 * - Multi-user presence
 * - Agent-to-user communication
 * - Live code editing with operational transformation
 * - Chat messages and suggestions
 */

import { WebSocketServer, WebSocket } from 'ws'
import { v4 as uuidv4 } from 'uuid'
import * as dotenv from 'dotenv'

dotenv.config()

interface ConnectedUser {
  id: string
  ws: WebSocket
  name: string
  email: string
  image?: string
  projectId?: string
  cursor?: {
    file: string
    line: number
    column: number
  }
  status: 'online' | 'away' | 'busy'
  lastSeen: Date
}

interface WebSocketMessage {
  type: 'chat' | 'presence' | 'edit' | 'suggestion' | 'status'
  payload: any
  userId?: string
  projectId?: string
  timestamp: Date
}

interface EditOperation {
  type: 'insert' | 'delete' | 'replace'
  file: string
  range: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  content?: string
  userId: string
  timestamp: Date
}

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'agent' | 'system'
  agentId?: string
  userId?: string
  projectId?: string
  timestamp: Date
  metadata?: {
    suggestions?: any[]
    files?: string[]
    type?: 'code' | 'text' | 'suggestion' | 'error'
  }
}

class ThorWebSocketServer {
  private wss: WebSocketServer
  private users: Map<string, ConnectedUser> = new Map()
  private projects: Map<string, Set<string>> = new Map() // projectId -> userIds
  private messageHistory: Map<string, ChatMessage[]> = new Map() // projectId -> messages

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ 
      port,
      perMessageDeflate: {
        zlibDeflateOptions: {
          threshold: 1024,
          concurrencyLimit: 10,
        },
        zlibInflateOptions: {
          chunkSize: 1024,
        },
        threshold: 1024,
        concurrencyLimit: 10,
        clientMaxNoContextTakeover: false,
        clientMaxWindowBits: 13,
        serverMaxNoContextTakeover: false,
        serverMaxWindowBits: 13,
      }
    })

    this.setupEventHandlers()
    console.log(`🚀 Thor.dev WebSocket server running on port ${port}`)
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const userId = uuidv4()
      console.log(`👋 User ${userId} connected`)

      // Initialize user connection
      const user: ConnectedUser = {
        id: userId,
        ws,
        name: 'Anonymous',
        email: '',
        status: 'online',
        lastSeen: new Date(),
      }
      
      this.users.set(userId, user)

      // Send welcome message
      this.sendToUser(userId, {
        type: 'status',
        payload: {
          type: 'connected',
          userId,
          message: 'Connected to Thor.dev workspace',
        },
        timestamp: new Date(),
      })

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString())
          this.handleMessage(userId, message)
        } catch (error) {
          console.error('Failed to parse message:', error)
          this.sendError(userId, 'Invalid message format')
        }
      })

      // Handle user disconnect
      ws.on('close', () => {
        console.log(`👋 User ${userId} disconnected`)
        this.handleUserDisconnect(userId)
      })

      // Handle connection errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error)
      })

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping()
        } else {
          clearInterval(heartbeat)
        }
      }, 30000)

      ws.on('pong', () => {
        const user = this.users.get(userId)
        if (user) {
          user.lastSeen = new Date()
        }
      })
    })

    // Cleanup inactive users every 5 minutes
    setInterval(() => {
      this.cleanupInactiveUsers()
    }, 5 * 60 * 1000)
  }

  private handleMessage(userId: string, message: WebSocketMessage) {
    const user = this.users.get(userId)
    if (!user) return

    user.lastSeen = new Date()

    switch (message.type) {
      case 'presence':
        this.handlePresenceMessage(userId, message.payload)
        break

      case 'chat':
        this.handleChatMessage(userId, message.payload)
        break

      case 'edit':
        this.handleEditMessage(userId, message.payload)
        break

      case 'suggestion':
        this.handleSuggestionMessage(userId, message.payload)
        break

      case 'status':
        this.handleStatusMessage(userId, message.payload)
        break

      default:
        console.warn(`Unknown message type: ${message.type}`)
    }
  }

  private handlePresenceMessage(userId: string, payload: any) {
    const user = this.users.get(userId)
    if (!user) return

    switch (payload.type) {
      case 'join_project':
        this.joinProject(userId, payload.projectId)
        break

      case 'leave_project':
        this.leaveProject(userId, payload.projectId)
        break

      case 'user_updated':
        // Update user info
        if (payload.user) {
          Object.assign(user, payload.user)
        }
        
        // Broadcast presence update to project members
        if (user.projectId) {
          this.broadcastToProject(user.projectId, {
            type: 'presence',
            payload: {
              type: 'user_updated',
              user: this.sanitizeUser(user),
            },
            userId,
            timestamp: new Date(),
          }, userId)
        }
        break
    }
  }

  private handleChatMessage(userId: string, payload: ChatMessage) {
    const user = this.users.get(userId)
    if (!user || !user.projectId) return

    // Store message in history
    if (!this.messageHistory.has(user.projectId)) {
      this.messageHistory.set(user.projectId, [])
    }
    
    const messages = this.messageHistory.get(user.projectId)!
    messages.push(payload)

    // Keep only last 1000 messages per project
    if (messages.length > 1000) {
      messages.splice(0, messages.length - 1000)
    }

    // Broadcast to all project members
    this.broadcastToProject(user.projectId, {
      type: 'chat',
      payload,
      userId,
      projectId: user.projectId,
      timestamp: new Date(),
    })
  }

  private handleEditMessage(userId: string, payload: EditOperation) {
    const user = this.users.get(userId)
    if (!user || !user.projectId) return

    // Simple operational transformation - in production, use a proper OT library
    const transformedEdit = this.transformEdit(payload)

    // Broadcast edit to all project members except sender
    this.broadcastToProject(user.projectId, {
      type: 'edit',
      payload: transformedEdit,
      userId,
      projectId: user.projectId,
      timestamp: new Date(),
    }, userId)
  }

  private handleSuggestionMessage(userId: string, payload: any) {
    const user = this.users.get(userId)
    if (!user || !user.projectId) return

    // Broadcast suggestion to all project members
    this.broadcastToProject(user.projectId, {
      type: 'suggestion',
      payload,
      userId,
      projectId: user.projectId,
      timestamp: new Date(),
    })
  }

  private handleStatusMessage(userId: string, payload: any) {
    const user = this.users.get(userId)
    if (!user) return

    // Update user status
    if (payload.status) {
      user.status = payload.status
    }

    // Broadcast status to project members
    if (user.projectId) {
      this.broadcastToProject(user.projectId, {
        type: 'status',
        payload: {
          ...payload,
          userId,
          user: this.sanitizeUser(user),
        },
        userId,
        timestamp: new Date(),
      }, userId)
    }
  }

  private joinProject(userId: string, projectId: string) {
    const user = this.users.get(userId)
    if (!user) return

    // Leave current project if any
    if (user.projectId) {
      this.leaveProject(userId, user.projectId)
    }

    // Join new project
    user.projectId = projectId
    
    if (!this.projects.has(projectId)) {
      this.projects.set(projectId, new Set())
    }
    
    this.projects.get(projectId)!.add(userId)

    // Send current project members to new user
    const projectUsers = Array.from(this.projects.get(projectId)!)
      .map(id => this.users.get(id))
      .filter(u => u && u.id !== userId)
      .map(u => this.sanitizeUser(u!))

    this.sendToUser(userId, {
      type: 'presence',
      payload: {
        type: 'presence_list',
        users: projectUsers,
      },
      timestamp: new Date(),
    })

    // Send chat history to new user
    const messages = this.messageHistory.get(projectId) || []
    if (messages.length > 0) {
      this.sendToUser(userId, {
        type: 'chat',
        payload: {
          type: 'history',
          messages: messages.slice(-50), // Send last 50 messages
        },
        timestamp: new Date(),
      })
    }

    // Notify other project members
    this.broadcastToProject(projectId, {
      type: 'presence',
      payload: {
        type: 'user_joined',
        user: this.sanitizeUser(user),
      },
      userId,
      timestamp: new Date(),
    }, userId)

    console.log(`👤 User ${userId} joined project ${projectId}`)
  }

  private leaveProject(userId: string, projectId: string) {
    const user = this.users.get(userId)
    if (!user) return

    const projectUsers = this.projects.get(projectId)
    if (projectUsers) {
      projectUsers.delete(userId)
      
      if (projectUsers.size === 0) {
        this.projects.delete(projectId)
        // Clean up message history for empty projects
        this.messageHistory.delete(projectId)
      } else {
        // Notify remaining project members
        this.broadcastToProject(projectId, {
          type: 'presence',
          payload: {
            type: 'user_left',
            userId,
          },
          timestamp: new Date(),
        })
      }
    }

    user.projectId = undefined
    console.log(`👤 User ${userId} left project ${projectId}`)
  }

  private handleUserDisconnect(userId: string) {
    const user = this.users.get(userId)
    if (!user) return

    // Leave current project
    if (user.projectId) {
      this.leaveProject(userId, user.projectId)
    }

    // Remove user
    this.users.delete(userId)
  }

  private transformEdit(edit: EditOperation): EditOperation {
    // Simple transformation - in production, implement proper OT
    // For now, just return the edit as-is
    // TODO: Implement proper operational transformation
    return {
      ...edit,
      timestamp: new Date(),
    }
  }

  private sendToUser(userId: string, message: WebSocketMessage) {
    const user = this.users.get(userId)
    if (user && user.ws.readyState === WebSocket.OPEN) {
      try {
        user.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Failed to send message to user ${userId}:`, error)
      }
    }
  }

  private sendError(userId: string, error: string) {
    this.sendToUser(userId, {
      type: 'status',
      payload: {
        type: 'error',
        message: error,
      },
      timestamp: new Date(),
    })
  }

  private broadcastToProject(projectId: string, message: WebSocketMessage, excludeUserId?: string) {
    const projectUsers = this.projects.get(projectId)
    if (!projectUsers) return

    projectUsers.forEach(userId => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, message)
      }
    })
  }

  private sanitizeUser(user: ConnectedUser) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      cursor: user.cursor,
      status: user.status,
      lastSeen: user.lastSeen,
    }
  }

  private cleanupInactiveUsers() {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    this.users.forEach((user, userId) => {
      if (user.lastSeen < fiveMinutesAgo && user.ws.readyState !== WebSocket.OPEN) {
        console.log(`🧹 Cleaning up inactive user ${userId}`)
        this.handleUserDisconnect(userId)
      }
    })
  }

  public getStats() {
    return {
      totalUsers: this.users.size,
      totalProjects: this.projects.size,
      totalMessages: Array.from(this.messageHistory.values()).reduce((sum, messages) => sum + messages.length, 0),
    }
  }
}

// Start server
const port = parseInt(process.env.WS_PORT || '8080')
const server = new ThorWebSocketServer(port)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Thor.dev WebSocket server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Thor.dev WebSocket server...')
  process.exit(0)
})

export default ThorWebSocketServer