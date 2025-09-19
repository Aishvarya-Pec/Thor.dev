/**
 * Thor.dev Plugin Loader
 * Loads and executes plugins for project enhancement
 */

import fs from 'fs/promises'
import path from 'path'
import { Plugin, PluginManifest } from '@/types'
import { prisma } from './prisma'

const PLUGINS_DIR = path.join(process.cwd(), '../../packages/plugins')

export async function loadPlugins(): Promise<Plugin[]> {
  try {
    const pluginDirs = await fs.readdir(PLUGINS_DIR)
    const plugins: Plugin[] = []

    for (const pluginDir of pluginDirs) {
      const pluginPath = path.join(PLUGINS_DIR, pluginDir)
      const manifestPath = path.join(pluginPath, 'plugin.json')

      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf8')
        const manifest: PluginManifest = JSON.parse(manifestContent)

        const plugin: Plugin = {
          id: pluginDir,
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          author: manifest.author,
          config: {
            options: {},
            enabled: true,
            autoRun: false,
          },
          isEnabled: true,
          manifest,
        }

        plugins.push(plugin)
      } catch (error) {
        console.warn(`Failed to load plugin ${pluginDir}:`, error)
      }
    }

    return plugins
  } catch (error) {
    console.error('Failed to load plugins directory:', error)
    return []
  }
}

export async function runPlugin(
  pluginId: string,
  projectId: string,
  options: Record<string, any> = {}
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    // Get project info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    // Load plugin
    const pluginPath = path.join(PLUGINS_DIR, pluginId)
    const manifestPath = path.join(pluginPath, 'plugin.json')
    const entryPath = path.join(pluginPath, 'index.js')

    // Check if plugin exists
    try {
      await fs.access(manifestPath)
      await fs.access(entryPath)
    } catch {
      return { success: false, error: 'Plugin not found' }
    }

    // Load manifest
    const manifestContent = await fs.readFile(manifestPath, 'utf8')
    const manifest: PluginManifest = JSON.parse(manifestContent)

    // Load and execute plugin
    delete require.cache[require.resolve(entryPath)]
    const plugin = require(entryPath)

    if (typeof plugin.apply !== 'function') {
      return { success: false, error: 'Plugin does not export an apply function' }
    }

    // Prepare project metadata
    const meta = {
      id: project.id,
      name: project.name,
      description: project.description,
      config: project.config ? JSON.parse(project.config) : {},
      projectPath: project.projectPath,
      repoUrl: project.repoUrl,
    }

    // Run plugin
    const result = await plugin.apply(project.projectPath, meta, options)

    // Log plugin execution
    console.log(`Plugin ${pluginId} executed for project ${projectId}:`, result)

    return { success: true, result }
  } catch (error) {
    console.error(`Plugin execution failed for ${pluginId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getPluginConfig(pluginId: string): Promise<PluginManifest | null> {
  try {
    const manifestPath = path.join(PLUGINS_DIR, pluginId, 'plugin.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf8')
    return JSON.parse(manifestContent)
  } catch {
    return null
  }
}

export async function validatePluginOptions(
  pluginId: string,
  options: Record<string, any>
): Promise<{ valid: boolean; errors: string[] }> {
  const manifest = await getPluginConfig(pluginId)
  if (!manifest) {
    return { valid: false, errors: ['Plugin not found'] }
  }

  const errors: string[] = []
  const config = manifest.config || {}

  for (const [key, value] of Object.entries(options)) {
    const configOption = config[key]
    if (!configOption) {
      errors.push(`Unknown option: ${key}`)
      continue
    }

    // Type validation
    if (configOption.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Option ${key} must be a boolean`)
    } else if (configOption.type === 'string' && typeof value !== 'string') {
      errors.push(`Option ${key} must be a string`)
    } else if (configOption.type === 'number' && typeof value !== 'number') {
      errors.push(`Option ${key} must be a number`)
    }

    // Enum validation
    if (configOption.options && !configOption.options.includes(value)) {
      errors.push(`Option ${key} must be one of: ${configOption.options.join(', ')}`)
    }
  }

  return { valid: errors.length === 0, errors }
}