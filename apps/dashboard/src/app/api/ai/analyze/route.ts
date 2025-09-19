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
    const rateLimitResult = await rateLimit(request, { max: 20, window: 60000 }) // 20 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { code, language = 'typescript', analysisType = 'bugs' } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    if (!['bugs', 'performance', 'security', 'style', 'tests'].includes(analysisType)) {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      )
    }

    console.log(`🔍 AI Code Analysis Request: ${analysisType} for ${language}`)

    const result = await aiService.analyzeCode({
      code,
      language,
      analysisType,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'AI analysis failed' },
        { status: 500 }
      )
    }

    console.log(`✅ AI Analysis completed using ${result.provider}`)

    // Parse the analysis result
    let analysis
    try {
      analysis = JSON.parse(result.content || '{}')
    } catch {
      // Fallback if response isn't JSON
      analysis = {
        issues: [],
        score: 80,
        summary: result.content || 'Analysis completed',
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      provider: result.provider,
      usage: result.usage,
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}