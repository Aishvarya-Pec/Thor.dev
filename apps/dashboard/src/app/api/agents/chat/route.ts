import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { aiAgentManager } from '@/lib/ai-agents'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(request, { max: 30, window: 60000 }) // 30 messages per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { agentId, message, projectId } = body

    if (!agentId || !message || !projectId) {
      return NextResponse.json(
        { error: 'Agent ID, message, and project ID are required' },
        { status: 400 }
      )
    }

    // Get project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: { email: session.user.email },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get current project files (simplified - in production, read from file system)
    const currentFiles: Record<string, string> = {}
    
    // Get recent chat history
    const recentMessages = [] // TODO: Implement chat history retrieval

    // Create agent context
    const context = {
      project,
      currentFiles,
      chatHistory: recentMessages,
    }

    console.log(`🤖 Agent ${agentId} processing message: ${message.substring(0, 100)}...`)

    // Process message with AI agent
    const agentResponse = await aiAgentManager.processMessage(agentId, message, context)

    console.log(`✅ Agent ${agentId} response generated`)

    return NextResponse.json({
      success: true,
      response: agentResponse,
      agentId,
      timestamp: new Date(),
    })

  } catch (error) {
    console.error('Agent chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}