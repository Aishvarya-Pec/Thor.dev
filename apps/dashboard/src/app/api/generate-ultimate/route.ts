import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { generateUltimateApp, UltimateAppConfig } from '@/lib/ultimate-app-generator'
import { generateId } from '@/lib/utils'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, appName, config } = body

    if (!prompt || !appName) {
      return NextResponse.json(
        { error: 'Prompt and app name are required' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        },
      })
    }

    // Generate unique project ID
    const projectId = generateId()
    const projectPath = path.join(process.cwd(), '../../tmp', `ultimate-${projectId}`)

    console.log(`🚀 Starting ultimate app generation: ${appName}`)
    console.log(`📋 Requirements: ${prompt}`)
    console.log(`⚙️ Config:`, config)

    // Create comprehensive app configuration
    const ultimateConfig: UltimateAppConfig = {
      framework: 'nextjs',
      template: 'ultimate',
      features: ['typescript', 'tailwind', 'prisma', 'nextauth', 'testing', 'deployment'],
      styling: 'tailwind',
      database: 'sqlite',
      auth: 'nextauth',
      deployment: 'vercel',
      plugins: [],
      
      // Frontend Configuration
      frontend: {
        framework: config?.frontend?.framework || 'nextjs',
        styling: config?.frontend?.styling || 'tailwind',
        components: config?.frontend?.components || 'shadcn',
        features: config?.frontend?.features || ['responsive', 'dark-mode', 'animations'],
      },
      
      // Backend Configuration
      backend: {
        type: config?.backend?.type || 'nextjs-api',
        database: config?.backend?.database || 'sqlite',
        auth: config?.backend?.auth || 'nextauth',
        features: config?.backend?.features || ['api', 'validation', 'rate-limiting'],
      },
      
      // Deployment Configuration
      deployment: {
        platform: config?.deployment?.platform || 'vercel',
        cicd: config?.deployment?.cicd !== false,
        monitoring: config?.deployment?.monitoring !== false,
        scaling: config?.deployment?.scaling || false,
      },
      
      // Advanced Features
      advanced: {
        realtime: config?.advanced?.realtime || false,
        chatAgent: config?.advanced?.chatAgent !== false, // Default to true
        collaboration: config?.advanced?.collaboration || false,
        testing: config?.advanced?.testing !== false, // Default to true
        security: config?.advanced?.security !== false, // Default to true
      },
    }

    // Create project in database
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name: appName,
        description: prompt,
        status: 'generating',
        type: ultimateConfig.frontend.framework,
        projectPath,
        prompt,
        config: JSON.stringify(ultimateConfig),
        userId: user.id,
      },
    })

    // Generate the ultimate app
    console.log(`🤖 Generating ultimate full-stack app...`)
    const generationResult = await generateUltimateApp({
      prompt,
      appName,
      config: ultimateConfig,
      userId: user.id,
    })

    if (!generationResult.success) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'failed' },
      })
      
      return NextResponse.json(
        { error: generationResult.error },
        { status: 500 }
      )
    }

    // Save generated files to disk
    await fs.mkdir(projectPath, { recursive: true })
    
    for (const [filePath, fileData] of Object.entries(generationResult.files)) {
      if (fileData.type === 'file' && fileData.content) {
        const fullPath = path.join(projectPath, filePath)
        await fs.mkdir(path.dirname(fullPath), { recursive: true })
        await fs.writeFile(fullPath, fileData.content)
      }
    }

    // Update project with generated info
    const previewUrl = `/preview/${projectId}`
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'generated',
        previewUrl,
      },
    })

    // Save comprehensive project metadata
    const metadataPath = path.join(process.cwd(), '../../data/projects', `${projectId}.json`)
    await fs.mkdir(path.dirname(metadataPath), { recursive: true })
    await fs.writeFile(
      metadataPath,
      JSON.stringify({
        ...project,
        generationResult,
        generatedAt: new Date().toISOString(),
        config: ultimateConfig,
        stats: {
          filesGenerated: Object.keys(generationResult.files).length,
          featuresImplemented: generationResult.features.length,
          testSuites: generationResult.tests.length,
          deploymentReady: true,
          chatAgentEnabled: ultimateConfig.advanced.chatAgent,
        },
      }, null, 2)
    )

    console.log(`✅ Ultimate app generated successfully: ${projectId}`)
    console.log(`📊 Stats:`)
    console.log(`   - Files: ${Object.keys(generationResult.files).length}`)
    console.log(`   - Features: ${generationResult.features.length}`)
    console.log(`   - Tests: ${generationResult.tests.length}`)
    console.log(`   - Chat Agent: ${ultimateConfig.advanced.chatAgent ? 'Enabled' : 'Disabled'}`)

    return NextResponse.json({
      success: true,
      projectId,
      appName,
      previewUrl,
      files: generationResult.files,
      structure: generationResult.structure,
      features: generationResult.features,
      tests: generationResult.tests,
      deployment: generationResult.deployment,
      chatAgent: generationResult.chatAgent,
      stats: {
        filesGenerated: Object.keys(generationResult.files).length,
        featuresImplemented: generationResult.features.length,
        testSuites: generationResult.tests.length,
        generationTime: Date.now(),
      },
    })

  } catch (error) {
    console.error('Ultimate generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate ultimate app' },
      { status: 500 }
    )
  }
}