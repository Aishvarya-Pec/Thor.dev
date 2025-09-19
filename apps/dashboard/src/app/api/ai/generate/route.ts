import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { aiService } from '@/lib/ai-services'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(request, { max: 10, window: 60000 }) // 10 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { prompt, language = 'typescript', framework = 'nextjs', context, files } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log(`🤖 AI Code Generation Request: ${prompt.substring(0, 100)}...`)

    const result = await aiService.generateCode({
      prompt,
      language,
      framework,
      context,
      files,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'AI generation failed' },
        { status: 500 }
      )
    }

    console.log(`✅ AI Generation completed using ${result.provider}`)

    return NextResponse.json({
      success: true,
      content: result.content,
      provider: result.provider,
      usage: result.usage,
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}