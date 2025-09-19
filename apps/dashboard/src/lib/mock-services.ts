/**
 * Mock Services for Thor.dev
 * Free, open-source implementations that don't require API keys
 */

import fs from 'fs/promises'
import path from 'path'
import { generateId } from './utils'

export interface MockLLMResponse {
  success: boolean
  content?: string
  error?: string
}

export interface MockDeploymentResult {
  success: boolean
  deployUrl?: string
  repoUrl?: string
  error?: string
}

/**
 * Mock LLM Service - Template-based code generation
 * Provides intelligent code generation without requiring API keys
 */
export class MockLLMService {
  private static templates = {
    dashboard: {
      keywords: ['dashboard', 'admin', 'analytics', 'stats'],
      files: {
        'src/app/dashboard/page.tsx': `'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { title: 'Total Users', value: '2,345', icon: Users, change: '+12%' },
    { title: 'Revenue', value: '$45,231', icon: TrendingUp, change: '+8%' },
    { title: 'Active Sessions', value: '1,234', icon: Activity, change: '+23%' },
    { title: 'Conversion Rate', value: '3.2%', icon: BarChart3, change: '+5%' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your analytics dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Payment processed</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">System update completed</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">Manage Users</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">View Reports</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <TrendingUp className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">Analytics</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Activity className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">Settings</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`,
      },
    },
    
    blog: {
      keywords: ['blog', 'post', 'article', 'content', 'cms'],
      files: {
        'src/app/blog/page.tsx': `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const blogPosts = [
  {
    id: 1,
    title: 'Getting Started with Next.js 14',
    excerpt: 'Learn the new features and improvements in Next.js 14',
    author: 'John Doe',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Development'
  },
  {
    id: 2,
    title: 'Building Modern Web Applications',
    excerpt: 'Best practices for creating scalable web applications',
    author: 'Jane Smith',
    date: '2024-01-12',
    readTime: '8 min read',
    category: 'Architecture'
  },
  {
    id: 3,
    title: 'The Future of Web Development',
    excerpt: 'Exploring upcoming trends and technologies',
    author: 'Mike Johnson',
    date: '2024-01-10',
    readTime: '6 min read',
    category: 'Trends'
  }
]

export default function Blog() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-gray-600">
          Insights, tutorials, and thoughts on web development
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
              <CardTitle className="text-xl">
                <Link href={\`/blog/\${post.id}\`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>By {post.author}</span>
                <span>{post.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}`,
        'src/app/blog/[id]/page.tsx': `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'

interface BlogPostProps {
  params: {
    id: string
  }
}

// Mock blog post data
const getBlogPost = (id: string) => {
  const posts = {
    '1': {
      id: 1,
      title: 'Getting Started with Next.js 14',
      content: \`
        <p>Next.js 14 brings exciting new features and improvements that make building web applications even more enjoyable and efficient.</p>
        
        <h2>New Features</h2>
        <ul>
          <li>Improved App Router with better performance</li>
          <li>Enhanced Server Components</li>
          <li>Better TypeScript support</li>
        </ul>
        
        <p>In this article, we'll explore these features and see how they can improve your development workflow.</p>
      \`,
      author: 'John Doe',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'Development'
    }
  }
  
  return posts[id as keyof typeof posts]
}

export default function BlogPost({ params }: BlogPostProps) {
  const post = getBlogPost(params.id)
  
  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">{post.readTime}</span>
          </div>
          <CardTitle className="text-3xl mb-4">{post.title}</CardTitle>
          <div className="flex items-center text-sm text-gray-500">
            <span>By {post.author}</span>
            <span className="mx-2">•</span>
            <span>{post.date}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      </Card>
    </div>
  )
}`,
      },
    },

    ecommerce: {
      keywords: ['shop', 'store', 'ecommerce', 'product', 'cart', 'checkout'],
      files: {
        'src/app/shop/page.tsx': `'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star } from 'lucide-react'
import { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'Premium Headphones',
    price: 199,
    rating: 4.5,
    image: '/api/placeholder/300/300',
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    price: 49,
    rating: 4.2,
    image: '/api/placeholder/300/300',
    category: 'Electronics'
  },
  {
    id: 3,
    name: 'Mechanical Keyboard',
    price: 129,
    rating: 4.8,
    image: '/api/placeholder/300/300',
    category: 'Electronics'
  }
]

export default function Shop() {
  const [cart, setCart] = useState<number[]>([])

  const addToCart = (productId: number) => {
    setCart([...cart, productId])
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Shop</h1>
          <p className="text-gray-600">Discover our amazing products</p>
        </div>
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-medium">{cart.length} items</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
              <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={\`h-4 w-4 \${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }\`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  ({product.rating})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">\${product.price}</span>
                <Button onClick={() => addToCart(product.id)}>
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}`,
      },
    },
  }

  static async generateContent(prompt: string): Promise<MockLLMResponse> {
    try {
      const lowerPrompt = prompt.toLowerCase()
      
      // Find matching template based on keywords
      for (const [templateName, template] of Object.entries(this.templates)) {
        if (template.keywords.some(keyword => lowerPrompt.includes(keyword))) {
          return {
            success: true,
            content: JSON.stringify(template.files, null, 2),
          }
        }
      }

      // Default response for unmatched prompts
      return {
        success: true,
        content: JSON.stringify({
          'src/app/page.tsx': `export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Generated based on: "${prompt}"
        </p>
        <div className="space-y-4">
          <p className="text-gray-500">
            This is a basic template. To get more specific components, 
            try using keywords like "dashboard", "blog", or "shop" in your prompt.
          </p>
        </div>
      </div>
    </div>
  )
}`,
        }, null, 2),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

/**
 * Mock GitHub Service - Local file storage instead of GitHub
 */
export class MockGitHubService {
  static async createRepository(config: {
    projectPath: string
    projectName: string
    description: string
  }): Promise<MockDeploymentResult> {
    try {
      // Create a local "repository" directory
      const repoPath = path.join(process.cwd(), 'data', 'repositories', config.projectName)
      await fs.mkdir(repoPath, { recursive: true })

      // Copy project files to "repository"
      await this.copyDirectory(config.projectPath, repoPath)

      // Create a mock repository URL
      const repoUrl = `file://${repoPath}`

      console.log(`📦 Mock repository created at: ${repoPath}`)

      return {
        success: true,
        repoUrl,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private static async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true })
    const entries = await fs.readdir(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        if (!['node_modules', '.git', '.next', 'dist'].includes(entry.name)) {
          await this.copyDirectory(srcPath, destPath)
        }
      } else {
        await fs.copyFile(srcPath, destPath)
      }
    }
  }
}

/**
 * Mock Deployment Service - Static file generation instead of cloud deployment
 */
export class MockDeploymentService {
  static async deployToStatic(config: {
    projectName: string
    projectPath: string
  }): Promise<MockDeploymentResult> {
    try {
      // Create static deployment directory
      const deployPath = path.join(process.cwd(), 'data', 'deployments', config.projectName)
      await fs.mkdir(deployPath, { recursive: true })

      // Build project (simplified)
      await this.buildProject(config.projectPath, deployPath)

      // Generate deployment info
      const deploymentId = generateId()
      const deployUrl = `http://localhost:3000/preview/${deploymentId}`

      // Save deployment metadata
      const deploymentMeta = {
        id: deploymentId,
        name: config.projectName,
        path: deployPath,
        url: deployUrl,
        createdAt: new Date().toISOString(),
        status: 'deployed',
      }

      await fs.writeFile(
        path.join(deployPath, 'deployment.json'),
        JSON.stringify(deploymentMeta, null, 2)
      )

      console.log(`🚀 Mock deployment created: ${deployUrl}`)

      return {
        success: true,
        deployUrl,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private static async buildProject(srcPath: string, destPath: string): Promise<void> {
    // Copy source files (simplified build process)
    const entries = await fs.readdir(srcPath, { withFileTypes: true })

    for (const entry of entries) {
      const srcFile = path.join(srcPath, entry.name)
      const destFile = path.join(destPath, entry.name)

      if (entry.isDirectory()) {
        if (!['node_modules', '.git', '.next'].includes(entry.name)) {
          await fs.mkdir(destFile, { recursive: true })
          await this.buildProject(srcFile, destFile)
        }
      } else {
        await fs.copyFile(srcFile, destFile)
      }
    }

    // Create a simple index.html for preview
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thor.dev Generated App</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; }
        .files { display: grid; gap: 1rem; }
        .file { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
        .file-name { font-weight: bold; color: #5724ff; }
        .file-content { margin-top: 0.5rem; font-family: monospace; background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Your App is Ready!</h1>
            <p>Generated by Thor.dev - Multi-Agent Workspace</p>
        </div>
        <div class="files">
            <div class="file">
                <div class="file-name">📁 Project Structure</div>
                <div class="file-content">
This is a preview of your generated Next.js application.
In a real deployment, this would be a fully functional app.

To run locally:
1. npm install
2. npm run dev
3. Open http://localhost:3000
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

    await fs.writeFile(path.join(destPath, 'index.html'), indexHtml)
  }
}

/**
 * Mock Email Service - Console logging instead of real emails
 */
export class MockEmailService {
  static async sendMagicLink(email: string, url: string): Promise<boolean> {
    console.log('📧 Mock Email Service - Magic Link')
    console.log(`To: ${email}`)
    console.log(`Magic Link: ${url}`)
    console.log('In production, this would send a real email.')
    return true
  }
}

/**
 * Check if we should use mock services (when API keys are missing)
 */
export function shouldUseMockServices(): boolean {
  return (
    !process.env.OPENAI_API_KEY &&
    !process.env.ANTHROPIC_API_KEY &&
    !process.env.GITHUB_TOKEN &&
    !process.env.VERCEL_TOKEN &&
    !process.env.NETLIFY_TOKEN
  )
}