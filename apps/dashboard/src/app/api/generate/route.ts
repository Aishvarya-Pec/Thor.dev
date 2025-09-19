import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { generateProject } from '@/lib/project-generator'
import { generateId } from '@/lib/utils'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, projectName, config = {} } = body

    if (!prompt || !projectName) {
      return NextResponse.json(
        { error: 'Prompt and project name are required' },
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
    const projectPath = path.join(process.cwd(), '../../tmp', `generated-${projectId}`)

    // Create project in database
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name: projectName,
        description: prompt,
        status: 'draft',
        type: config.framework || 'nextjs',
        projectPath,
        prompt,
        config: JSON.stringify(config),
        userId: user.id,
      },
    })

    // Generate the project files
    console.log(`🔨 Generating project: ${projectName}`)
    const generationResult = await generateProject({
      projectId,
      projectName,
      prompt,
      config: {
        framework: 'nextjs',
        template: 'default',
        features: ['typescript', 'tailwind', 'prisma', 'nextauth'],
        styling: 'tailwind',
        database: 'sqlite',
        auth: 'nextauth',
        deployment: 'vercel',
        ...config,
      },
      outputPath: projectPath,
    })

    if (!generationResult.success) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'archived' },
      })
      
      return NextResponse.json(
        { error: generationResult.error },
        { status: 500 }
      )
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

    // Save project metadata
    const metadataPath = path.join(process.cwd(), '../../data/projects', `${projectId}.json`)
    await fs.mkdir(path.dirname(metadataPath), { recursive: true })
    await fs.writeFile(
      metadataPath,
      JSON.stringify({
        ...project,
        files: generationResult.files,
        generatedAt: new Date().toISOString(),
        config,
      }, null, 2)
    )

    console.log(`✅ Project generated successfully: ${projectId}`)

    return NextResponse.json({
      projectId,
      status: 'success',
      previewUrl,
      files: generationResult.files,
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate project' },
      { status: 500 }
    )
  }
}