import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { aiService } from '@/lib/ai-services'
import { rateLimit } from '@/lib/rate-limit'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting for app modifications
    const rateLimitResult = await rateLimit(request, { max: 20, window: 60000 }) // 20 modifications per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { projectId, instruction, conversationContext } = body

    if (!projectId || !instruction) {
      return NextResponse.json(
        { error: 'Project ID and instruction are required' },
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

    console.log(`🤖 Chat agent processing instruction: ${instruction}`)

    // Load current project files
    const projectPath = project.projectPath!
    const currentFiles = await loadProjectFiles(projectPath)

    // Analyze the instruction to determine what needs to be modified
    const analysisResult = await aiService.generateCode({
      prompt: `
As a senior full-stack developer, analyze this user instruction for a generated app:

INSTRUCTION: "${instruction}"

CURRENT PROJECT: ${project.name}
DESCRIPTION: ${project.description}
CONVERSATION CONTEXT: ${JSON.stringify(conversationContext || [])}

CURRENT FILES: ${JSON.stringify(Object.keys(currentFiles).slice(0, 20))} (showing first 20)

Please analyze what needs to be done and provide a JSON response with:
{
  "action": "modify_file" | "create_file" | "delete_file" | "add_feature" | "modify_config" | "explain" | "error",
  "confidence": 0.0-1.0,
  "files_to_modify": ["path1", "path2"],
  "files_to_create": ["path3", "path4"],
  "files_to_delete": ["path5"],
  "explanation": "What will be done",
  "requires_dependencies": ["package1", "package2"],
  "breaking_changes": true/false,
  "estimated_complexity": "low" | "medium" | "high"
}
      `,
      language: 'json',
      context: 'App modification analysis',
      files: currentFiles,
    })

    let analysis
    try {
      analysis = JSON.parse(analysisResult.content || '{}')
    } catch {
      analysis = {
        action: 'error',
        explanation: 'Could not parse instruction. Please be more specific.',
      }
    }

    if (analysis.action === 'error') {
      return NextResponse.json({
        success: false,
        message: analysis.explanation || 'Could not understand the instruction',
        suggestions: [
          'Try being more specific about what you want to change',
          'Examples: "Add dark mode toggle", "Create a user profile page", "Add authentication"',
        ],
      })
    }

    // Execute the modifications based on analysis
    const modificationResults = await executeModifications(
      projectPath,
      currentFiles,
      analysis,
      instruction,
      project
    )

    // Save changes to disk
    for (const [filePath, content] of Object.entries(modificationResults.modifiedFiles)) {
      const fullPath = path.join(projectPath, filePath)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content)
    }

    // Update project metadata
    await updateProjectMetadata(projectId, {
      lastModified: new Date(),
      modifications: modificationResults.changes,
    })

    console.log(`✅ Chat agent completed modification: ${modificationResults.changes.length} changes`)

    return NextResponse.json({
      success: true,
      message: `✅ ${analysis.explanation}`,
      changes: modificationResults.changes,
      modifiedFiles: Object.keys(modificationResults.modifiedFiles),
      createdFiles: modificationResults.createdFiles,
      deletedFiles: modificationResults.deletedFiles,
      dependencies: analysis.requires_dependencies || [],
      breakingChanges: analysis.breaking_changes || false,
      complexity: analysis.estimated_complexity || 'medium',
      nextSteps: modificationResults.nextSteps,
    })

  } catch (error) {
    console.error('Chat agent modification error:', error)
    return NextResponse.json(
      { error: 'Failed to process modification' },
      { status: 500 }
    )
  }
}

async function loadProjectFiles(projectPath: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  
  try {
    await loadFilesRecursive(projectPath, '', files)
  } catch (error) {
    console.warn('Could not load all project files:', error)
  }
  
  return files
}

async function loadFilesRecursive(
  basePath: string,
  relativePath: string,
  files: Record<string, string>
): Promise<void> {
  const fullPath = path.join(basePath, relativePath)
  
  try {
    const stats = await fs.stat(fullPath)
    
    if (stats.isDirectory()) {
      const entries = await fs.readdir(fullPath)
      for (const entry of entries) {
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          await loadFilesRecursive(basePath, path.join(relativePath, entry), files)
        }
      }
    } else if (stats.isFile()) {
      const ext = path.extname(relativePath).toLowerCase()
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml'].includes(ext)) {
        const content = await fs.readFile(fullPath, 'utf8')
        files[relativePath] = content
      }
    }
  } catch (error) {
    // Skip files we can't read
  }
}

async function executeModifications(
  projectPath: string,
  currentFiles: Record<string, string>,
  analysis: any,
  instruction: string,
  project: any
) {
  const modifiedFiles: Record<string, string> = {}
  const createdFiles: string[] = []
  const deletedFiles: string[] = []
  const changes: string[] = []
  const nextSteps: string[] = []

  // Handle file modifications
  if (analysis.files_to_modify && analysis.files_to_modify.length > 0) {
    for (const filePath of analysis.files_to_modify) {
      const currentContent = currentFiles[filePath] || ''
      
      const modificationResult = await aiService.generateCode({
        prompt: `
Modify the file ${filePath} according to this instruction: "${instruction}"

CURRENT CONTENT:
\`\`\`
${currentContent}
\`\`\`

Requirements:
- Preserve existing functionality
- Follow TypeScript and React best practices
- Maintain code style and formatting
- Add proper error handling
- Include necessary imports
- Add comments for new code
- Ensure backwards compatibility

Return the complete modified file content.
        `,
        language: getLanguageFromPath(filePath),
        framework: 'nextjs',
        context: `Modifying ${filePath} in app: ${project.name}`,
        files: currentFiles,
      })

      if (modificationResult.success && modificationResult.content) {
        modifiedFiles[filePath] = modificationResult.content
        changes.push(`Modified ${filePath}`)
      }
    }
  }

  // Handle file creation
  if (analysis.files_to_create && analysis.files_to_create.length > 0) {
    for (const filePath of analysis.files_to_create) {
      const creationResult = await aiService.generateCode({
        prompt: `
Create a new file ${filePath} according to this instruction: "${instruction}"

Context:
- Project: ${project.name}
- Description: ${project.description}
- Existing files: ${Object.keys(currentFiles).slice(0, 10).join(', ')}

Requirements:
- Follow project structure and conventions
- Use TypeScript and modern React patterns
- Include proper imports and exports
- Add comprehensive error handling
- Include JSDoc comments
- Follow accessibility best practices
- Ensure mobile responsiveness
- Add proper TypeScript types

Return the complete file content.
        `,
        language: getLanguageFromPath(filePath),
        framework: 'nextjs',
        context: `Creating ${filePath} in app: ${project.name}`,
        files: currentFiles,
      })

      if (creationResult.success && creationResult.content) {
        modifiedFiles[filePath] = creationResult.content
        createdFiles.push(filePath)
        changes.push(`Created ${filePath}`)
      }
    }
  }

  // Handle file deletion
  if (analysis.files_to_delete && analysis.files_to_delete.length > 0) {
    for (const filePath of analysis.files_to_delete) {
      try {
        await fs.unlink(path.join(projectPath, filePath))
        deletedFiles.push(filePath)
        changes.push(`Deleted ${filePath}`)
      } catch (error) {
        console.warn(`Could not delete ${filePath}:`, error)
      }
    }
  }

  // Generate next steps
  if (analysis.requires_dependencies && analysis.requires_dependencies.length > 0) {
    nextSteps.push(`Install dependencies: ${analysis.requires_dependencies.join(', ')}`)
  }

  if (analysis.breaking_changes) {
    nextSteps.push('Review changes carefully - breaking changes detected')
  }

  if (analysis.estimated_complexity === 'high') {
    nextSteps.push('Test thoroughly - complex changes made')
  }

  return {
    modifiedFiles,
    createdFiles,
    deletedFiles,
    changes,
    nextSteps,
  }
}

async function updateProjectMetadata(projectId: string, updates: any) {
  try {
    const metadataPath = path.join(process.cwd(), '../../data/projects', `${projectId}.json`)
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'))
    
    Object.assign(metadata, updates)
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.warn('Could not update project metadata:', error)
  }
}

function getLanguageFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const langMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.json': 'json',
    '.md': 'markdown',
    '.yml': 'yaml',
    '.yaml': 'yaml',
  }
  return langMap[ext] || 'text'
}