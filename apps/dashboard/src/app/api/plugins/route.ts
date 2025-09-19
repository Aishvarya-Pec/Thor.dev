import { NextRequest, NextResponse } from 'next/server'
import { loadPlugins, runPlugin } from '@/lib/plugin-loader'

export async function GET(request: NextRequest) {
  try {
    const plugins = await loadPlugins()
    return NextResponse.json(plugins)
  } catch (error) {
    console.error('Failed to load plugins:', error)
    return NextResponse.json(
      { error: 'Failed to load plugins' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pluginId, projectId, options = {} } = await request.json()

    if (!pluginId || !projectId) {
      return NextResponse.json(
        { error: 'Plugin ID and Project ID are required' },
        { status: 400 }
      )
    }

    const result = await runPlugin(pluginId, projectId, options)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to run plugin:', error)
    return NextResponse.json(
      { error: 'Failed to run plugin' },
      { status: 500 }
    )
  }
}