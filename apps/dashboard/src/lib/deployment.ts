/**
 * Thor.dev Deployment System
 * Handles GitHub repository creation and deployment to Vercel/Netlify
 */

import { Octokit } from 'octokit'
import fs from 'fs/promises'
import path from 'path'
import archiver from 'archiver'
import fetch from 'node-fetch'

interface GitHubRepoConfig {
  projectPath: string
  projectName: string
  description: string
  githubToken: string
  isPrivate?: boolean
}

interface DeploymentConfig {
  projectName: string
  repoUrl: string
  githubToken: string
  config?: Record<string, any>
}

interface VercelDeployConfig extends DeploymentConfig {
  vercelToken: string
}

interface NetlifyDeployConfig {
  projectName: string
  projectPath: string
  repoUrl: string
  netlifyToken: string
  config?: Record<string, any>
}

interface DeploymentResult {
  success: boolean
  deployUrl?: string
  repoUrl?: string
  error?: string
}

/**
 * Create GitHub repository and push project files
 */
export async function createGitHubRepo(config: GitHubRepoConfig): Promise<DeploymentResult> {
  try {
    const octokit = new Octokit({
      auth: config.githubToken,
    })

    // Get authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated()
    
    // Create repository
    const repoName = config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    console.log(`📦 Creating GitHub repository: ${user.login}/${repoName}`)
    
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: config.description,
      private: config.isPrivate || false,
      auto_init: false,
    })

    // Read project files and create commits
    const files = await getProjectFiles(config.projectPath)
    
    // Create initial commit with all files
    const commits = await createCommits(octokit, user.login, repoName, files)
    
    console.log(`✅ Repository created: ${repo.html_url}`)
    console.log(`📝 Created ${commits.length} commits`)

    return {
      success: true,
      repoUrl: repo.html_url,
    }

  } catch (error) {
    console.error('GitHub repository creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Deploy to Vercel
 */
export async function deployToVercel(config: VercelDeployConfig): Promise<DeploymentResult> {
  try {
    console.log(`🚀 Deploying ${config.projectName} to Vercel...`)

    // Create Vercel project
    const projectResponse = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        gitRepository: {
          type: 'github',
          repo: config.repoUrl.replace('https://github.com/', ''),
        },
        framework: 'nextjs',
        buildCommand: 'npm run build',
        outputDirectory: '.next',
        installCommand: 'npm install',
        environmentVariables: config.config?.environmentVariables || [],
      }),
    })

    if (!projectResponse.ok) {
      const error = await projectResponse.text()
      throw new Error(`Vercel project creation failed: ${error}`)
    }

    const project = await projectResponse.json()

    // Trigger deployment
    const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: project.name,
        gitSource: {
          type: 'github',
          repo: config.repoUrl.replace('https://github.com/', ''),
          ref: 'main',
        },
      }),
    })

    if (!deployResponse.ok) {
      const error = await deployResponse.text()
      throw new Error(`Vercel deployment failed: ${error}`)
    }

    const deployment = await deployResponse.json()
    const deployUrl = `https://${deployment.url}`

    console.log(`✅ Deployed to Vercel: ${deployUrl}`)

    return {
      success: true,
      deployUrl,
    }

  } catch (error) {
    console.error('Vercel deployment failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Deploy to Netlify
 */
export async function deployToNetlify(config: NetlifyDeployConfig): Promise<DeploymentResult> {
  try {
    console.log(`🚀 Deploying ${config.projectName} to Netlify...`)

    // Create site
    const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.netlifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        repo: {
          provider: 'github',
          repo: config.repoUrl.replace('https://github.com/', ''),
          branch: 'main',
        },
        build_settings: {
          cmd: 'npm run build',
          dir: 'out',
        },
      }),
    })

    if (!siteResponse.ok) {
      const error = await siteResponse.text()
      throw new Error(`Netlify site creation failed: ${error}`)
    }

    const site = await siteResponse.json()

    // Trigger build
    const buildResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/builds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.netlifyToken}`,
      },
    })

    if (!buildResponse.ok) {
      const error = await buildResponse.text()
      throw new Error(`Netlify build trigger failed: ${error}`)
    }

    const deployUrl = site.ssl_url || site.url

    console.log(`✅ Deployed to Netlify: ${deployUrl}`)

    return {
      success: true,
      deployUrl,
    }

  } catch (error) {
    console.error('Netlify deployment failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create deployment zip for manual upload
 */
export async function createDeploymentZip(projectPath: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve(outputPath))
    archive.on('error', reject)

    archive.pipe(output)
    archive.directory(projectPath, false)
    archive.finalize()
  })
}

/**
 * Helper functions
 */
async function getProjectFiles(projectPath: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  
  async function readDir(dir: string, prefix = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.join(prefix, entry.name)
      
      // Skip node_modules, .git, and other unnecessary directories
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          await readDir(fullPath, relativePath)
        }
      } else {
        // Skip unnecessary files
        if (!entry.name.startsWith('.') || ['.env.example', '.gitignore'].includes(entry.name)) {
          const content = await fs.readFile(fullPath, 'utf8')
          files[relativePath] = content
        }
      }
    }
  }
  
  await readDir(projectPath)
  return files
}

async function createCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  files: Record<string, string>
): Promise<any[]> {
  const commits = []
  
  // Create initial commit
  const tree = await octokit.rest.git.createTree({
    owner,
    repo,
    tree: Object.entries(files).map(([path, content]) => ({
      path,
      mode: '100644' as const,
      type: 'blob' as const,
      content,
    })),
  })

  const commit = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: 'Initial commit - Generated by Thor.dev',
    tree: tree.data.sha,
  })

  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: 'refs/heads/main',
    sha: commit.data.sha,
  })

  commits.push(commit)
  return commits
}