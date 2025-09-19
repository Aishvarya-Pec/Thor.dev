/**
 * Thor.dev AI Services
 * Free, open-source AI integrations for competitive coding assistance
 */

import fetch from 'node-fetch'

export interface AIModelConfig {
  provider: 'ollama' | 'huggingface' | 'openai' | 'anthropic' | 'cohere' | 'mock'
  model: string
  apiKey?: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  success: boolean
  content?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

export interface CodeGenerationRequest {
  prompt: string
  language?: string
  framework?: string
  context?: string
  files?: Record<string, string>
}

export interface CodeAnalysisRequest {
  code: string
  language: string
  analysisType: 'bugs' | 'performance' | 'security' | 'style' | 'tests'
}

/**
 * Ollama Service - Local AI models (Llama, CodeLlama, etc.)
 */
export class OllamaService {
  private baseUrl: string
  private model: string

  constructor(config: { baseUrl?: string; model?: string } = {}) {
    this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    this.model = config.model || process.env.OLLAMA_MODEL || 'codellama:7b'
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        timeout: 5000,
      })
      return response.ok
    } catch {
      return false
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildCodePrompt(request)
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            max_tokens: 4000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        content: data.response,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async analyzeCode(request: CodeAnalysisRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(request)
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            max_tokens: 2000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        content: data.response,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private buildCodePrompt(request: CodeGenerationRequest): string {
    let prompt = `You are an expert ${request.language || 'TypeScript'} developer using ${request.framework || 'Next.js'}.\n\n`
    
    if (request.context) {
      prompt += `Context: ${request.context}\n\n`
    }

    if (request.files && Object.keys(request.files).length > 0) {
      prompt += `Existing files:\n`
      for (const [filename, content] of Object.entries(request.files)) {
        prompt += `\n${filename}:\n\`\`\`\n${content}\n\`\`\`\n`
      }
      prompt += `\n`
    }

    prompt += `Task: ${request.prompt}\n\n`
    prompt += `Please provide clean, production-ready code with:\n`
    prompt += `- Proper TypeScript types\n`
    prompt += `- Error handling\n`
    prompt += `- Comments for complex logic\n`
    prompt += `- Modern best practices\n\n`
    prompt += `Return only the code without explanations, wrapped in appropriate code blocks.`

    return prompt
  }

  private buildAnalysisPrompt(request: CodeAnalysisRequest): string {
    let prompt = `You are a senior code reviewer analyzing ${request.language} code for ${request.analysisType}.\n\n`
    
    prompt += `Code to analyze:\n\`\`\`${request.language}\n${request.code}\n\`\`\`\n\n`
    
    switch (request.analysisType) {
      case 'bugs':
        prompt += `Find potential bugs, logic errors, and runtime issues. Provide specific fixes.`
        break
      case 'performance':
        prompt += `Identify performance bottlenecks and suggest optimizations.`
        break
      case 'security':
        prompt += `Look for security vulnerabilities and suggest secure alternatives.`
        break
      case 'style':
        prompt += `Review code style, naming conventions, and best practices.`
        break
      case 'tests':
        prompt += `Suggest comprehensive test cases for this code.`
        break
    }

    prompt += `\n\nProvide a JSON response with:\n`
    prompt += `{\n`
    prompt += `  "issues": [{"type": "bug|performance|security|style", "line": number, "message": "description", "fix": "suggested fix"}],\n`
    prompt += `  "score": number (0-100),\n`
    prompt += `  "summary": "overall assessment"\n`
    prompt += `}`

    return prompt
  }
}

/**
 * Hugging Face Service - Free inference API
 */
export class HuggingFaceService {
  private apiKey: string
  private model: string

  constructor(config: { apiKey?: string; model?: string } = {}) {
    this.apiKey = config.apiKey || process.env.HUGGINGFACE_API_KEY || ''
    this.model = config.model || 'microsoft/DialoGPT-medium'
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0
  }

  async generateCode(request: CodeGenerationRequest): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Hugging Face API key not provided')
      }

      const response = await fetch(`https://api-inference.huggingface.co/models/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: this.buildCodePrompt(request),
          parameters: {
            max_length: 4000,
            temperature: 0.1,
            do_sample: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        content: data[0]?.generated_text || '',
        usage: {
          promptTokens: 0, // HF doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private buildCodePrompt(request: CodeGenerationRequest): string {
    return `Generate ${request.language || 'TypeScript'} code for: ${request.prompt}\n\nCode:`
  }
}

/**
 * Cohere Service - Free tier available
 */
export class CohereService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.COHERE_API_KEY || ''
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0
  }

  async generateCode(request: CodeGenerationRequest): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Cohere API key not provided')
      }

      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command',
          prompt: this.buildCodePrompt(request),
          max_tokens: 4000,
          temperature: 0.1,
          k: 0,
          stop_sequences: [],
          return_likelihoods: 'NONE',
        }),
      })

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        content: data.generations[0]?.text || '',
        usage: {
          promptTokens: data.meta?.billed_units?.input_tokens || 0,
          completionTokens: data.meta?.billed_units?.output_tokens || 0,
          totalTokens: (data.meta?.billed_units?.input_tokens || 0) + (data.meta?.billed_units?.output_tokens || 0),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private buildCodePrompt(request: CodeGenerationRequest): string {
    return `Generate clean, production-ready ${request.language || 'TypeScript'} code for: ${request.prompt}`
  }
}

/**
 * AI Service Manager - Automatically selects best available service
 */
export class AIServiceManager {
  private services: Array<{
    name: string
    service: OllamaService | HuggingFaceService | CohereService
    priority: number
  }> = []

  constructor() {
    this.initializeServices()
  }

  private async initializeServices() {
    // Ollama (highest priority - local and free)
    const ollama = new OllamaService()
    if (await ollama.isAvailable()) {
      this.services.push({ name: 'ollama', service: ollama, priority: 1 })
    }

    // Hugging Face (free tier)
    const huggingface = new HuggingFaceService()
    if (await huggingface.isAvailable()) {
      this.services.push({ name: 'huggingface', service: huggingface, priority: 2 })
    }

    // Cohere (free tier)
    const cohere = new CohereService()
    if (await cohere.isAvailable()) {
      this.services.push({ name: 'cohere', service: cohere, priority: 3 })
    }

    // Sort by priority
    this.services.sort((a, b) => a.priority - b.priority)
  }

  async generateCode(request: CodeGenerationRequest): Promise<AIResponse & { provider?: string }> {
    await this.initializeServices()

    if (this.services.length === 0) {
      // Fallback to enhanced mock service
      return this.getMockResponse(request)
    }

    // Try services in priority order
    for (const { name, service } of this.services) {
      try {
        const response = await service.generateCode(request)
        if (response.success) {
          return { ...response, provider: name }
        }
      } catch (error) {
        console.warn(`${name} service failed:`, error)
        continue
      }
    }

    // All services failed, use mock
    return this.getMockResponse(request)
  }

  async analyzeCode(request: CodeAnalysisRequest): Promise<AIResponse & { provider?: string }> {
    await this.initializeServices()

    // Only Ollama supports code analysis currently
    const ollamaService = this.services.find(s => s.name === 'ollama')?.service as OllamaService
    
    if (ollamaService) {
      try {
        const response = await ollamaService.analyzeCode(request)
        if (response.success) {
          return { ...response, provider: 'ollama' }
        }
      } catch (error) {
        console.warn('Ollama analysis failed:', error)
      }
    }

    // Fallback to mock analysis
    return this.getMockAnalysis(request)
  }

  private getMockResponse(request: CodeGenerationRequest): AIResponse & { provider: string } {
    // Enhanced mock responses based on prompt analysis
    const { MockLLMService } = require('./mock-services')
    
    const mockResult = MockLLMService.generateContent(request.prompt)
    
    return {
      success: true,
      content: mockResult.content || this.getBasicMockCode(request),
      provider: 'mock',
      usage: {
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
      },
    }
  }

  private getMockAnalysis(request: CodeAnalysisRequest): AIResponse & { provider: string } {
    const analysis = {
      issues: [
        {
          type: request.analysisType,
          line: 1,
          message: `Mock ${request.analysisType} analysis - consider adding proper error handling`,
          fix: 'Add try-catch blocks and input validation',
        },
      ],
      score: 85,
      summary: `Code looks generally good with minor ${request.analysisType} improvements needed`,
    }

    return {
      success: true,
      content: JSON.stringify(analysis, null, 2),
      provider: 'mock',
      usage: {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      },
    }
  }

  private getBasicMockCode(request: CodeGenerationRequest): string {
    return `// Generated by Thor.dev AI Service
// Task: ${request.prompt}

export default function GeneratedComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Generated Component
      </h1>
      <p className="text-gray-600">
        This component was generated based on: "${request.prompt}"
      </p>
      <div className="mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Action Button
        </button>
      </div>
    </div>
  )
}`
  }

  getAvailableServices(): string[] {
    return this.services.map(s => s.name)
  }
}

// Export singleton instance
export const aiService = new AIServiceManager()