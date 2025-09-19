'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { Project, Agent, ChatMessage, DockPanel, WorkspaceLayout, Suggestion } from '@/types'
import { generateId } from '@/lib/utils'

interface WorkspaceState {
  currentProject?: Project
  projects: Project[]
  agents: Agent[]
  messages: ChatMessage[]
  suggestions: Suggestion[]
  layout: WorkspaceLayout
  isLoading: boolean
  error?: string
}

type WorkspaceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_SUGGESTION'; payload: Suggestion }
  | { type: 'UPDATE_SUGGESTION'; payload: { id: string; status: 'accepted' | 'rejected' } }
  | { type: 'UPDATE_LAYOUT'; payload: Partial<WorkspaceLayout> }
  | { type: 'ADD_PANEL'; payload: DockPanel }
  | { type: 'UPDATE_PANEL'; payload: { id: string; updates: Partial<DockPanel> } }
  | { type: 'REMOVE_PANEL'; payload: string }

const initialAgents: Agent[] = [
  {
    id: 'designer-ai',
    name: 'Designer AI',
    type: 'designer',
    description: 'Creates beautiful, modern UI designs with best UX practices',
    config: {
      capabilities: ['ui-design', 'ux-patterns', 'color-schemes', 'typography', 'wireframes'],
      restrictions: ['no-backend-code', 'no-database-design'],
    },
    isActive: true,
    status: 'idle',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'coder-ai',
    name: 'Coder AI',
    type: 'coder',
    description: 'Writes clean, efficient code with modern best practices',
    config: {
      capabilities: ['frontend-code', 'backend-code', 'api-design', 'database-schema', 'testing'],
      restrictions: ['no-ui-design'],
    },
    isActive: true,
    status: 'idle',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tester-ai',
    name: 'Tester AI',
    type: 'tester',
    description: 'Ensures code quality through comprehensive testing and analysis',
    config: {
      capabilities: ['unit-testing', 'integration-testing', 'performance-testing', 'accessibility-testing', 'security-testing'],
      restrictions: ['no-production-deployment'],
    },
    isActive: true,
    status: 'idle',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'deployer-ai',
    name: 'Deployer AI',
    type: 'deployer',
    description: 'Handles deployment, CI/CD, and infrastructure management',
    config: {
      capabilities: ['deployment', 'ci-cd', 'infrastructure', 'monitoring', 'scaling'],
      restrictions: ['no-code-changes'],
    },
    isActive: true,
    status: 'idle',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const initialLayout: WorkspaceLayout = {
  panels: [
    {
      id: 'designer-panel',
      title: 'Designer AI',
      type: 'agent',
      isMinimized: false,
      isFloating: false,
      position: { x: 0, y: 0, width: 400, height: 600 },
      zIndex: 1,
      data: { agentId: 'designer-ai' },
    },
    {
      id: 'coder-panel',
      title: 'Coder AI',
      type: 'agent',
      isMinimized: false,
      isFloating: false,
      position: { x: 400, y: 0, width: 400, height: 600 },
      zIndex: 1,
      data: { agentId: 'coder-ai' },
    },
    {
      id: 'tester-panel',
      title: 'Tester AI',
      type: 'agent',
      isMinimized: false,
      isFloating: false,
      position: { x: 0, y: 600, width: 400, height: 400 },
      zIndex: 1,
      data: { agentId: 'tester-ai' },
    },
    {
      id: 'deployer-panel',
      title: 'Deployer AI',
      type: 'agent',
      isMinimized: false,
      isFloating: false,
      position: { x: 400, y: 600, width: 400, height: 400 },
      zIndex: 1,
      data: { agentId: 'deployer-ai' },
    },
    {
      id: 'editor-panel',
      title: 'Code Editor',
      type: 'editor',
      isMinimized: false,
      isFloating: false,
      position: { x: 800, y: 0, width: 600, height: 700 },
      zIndex: 1,
    },
    {
      id: 'preview-panel',
      title: 'Preview',
      type: 'preview',
      isMinimized: false,
      isFloating: false,
      position: { x: 800, y: 700, width: 600, height: 300 },
      zIndex: 1,
    },
  ],
  activePanel: 'designer-panel',
  sidebarWidth: 300,
  bottomPanelHeight: 200,
}

const initialState: WorkspaceState = {
  projects: [],
  agents: initialAgents,
  messages: [],
  suggestions: [],
  layout: initialLayout,
  isLoading: false,
}

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload }
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
        currentProject: state.currentProject?.id === action.payload.id
          ? { ...state.currentProject, ...action.payload.updates }
          : state.currentProject,
      }
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload }
    
    case 'SET_AGENTS':
      return { ...state, agents: action.payload }
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    
    case 'ADD_SUGGESTION':
      return { ...state, suggestions: [...state.suggestions, action.payload] }
    
    case 'UPDATE_SUGGESTION':
      return {
        ...state,
        suggestions: state.suggestions.map(s =>
          s.id === action.payload.id ? { ...s, status: action.payload.status } : s
        ),
      }
    
    case 'UPDATE_LAYOUT':
      return { ...state, layout: { ...state.layout, ...action.payload } }
    
    case 'ADD_PANEL':
      return {
        ...state,
        layout: {
          ...state.layout,
          panels: [...state.layout.panels, action.payload],
        },
      }
    
    case 'UPDATE_PANEL':
      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map(p =>
            p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
          ),
        },
      }
    
    case 'REMOVE_PANEL':
      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.filter(p => p.id !== action.payload),
        },
      }
    
    default:
      return state
  }
}

interface WorkspaceContextValue {
  state: WorkspaceState
  actions: {
    setLoading: (loading: boolean) => void
    setError: (error: string) => void
    setCurrentProject: (project: Project) => void
    addProject: (project: Project) => void
    updateProject: (id: string, updates: Partial<Project>) => void
    loadProjects: () => Promise<void>
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
    addSuggestion: (suggestion: Omit<Suggestion, 'id' | 'createdAt'>) => void
    acceptSuggestion: (id: string) => void
    rejectSuggestion: (id: string) => void
    updateLayout: (updates: Partial<WorkspaceLayout>) => void
    addPanel: (panel: Omit<DockPanel, 'id'>) => void
    updatePanel: (id: string, updates: Partial<DockPanel>) => void
    removePanel: (id: string) => void
  }
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState)

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const setCurrentProject = useCallback((project: Project) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })
  }, [])

  const addProject = useCallback((project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project })
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } })
  }, [])

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to load projects')
      const projects = await response.json()
      dispatch({ type: 'SET_PROJECTS', payload: projects })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const fullMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    }
    dispatch({ type: 'ADD_MESSAGE', payload: fullMessage })
  }, [])

  const addSuggestion = useCallback((suggestion: Omit<Suggestion, 'id' | 'createdAt'>) => {
    const fullSuggestion: Suggestion = {
      ...suggestion,
      id: generateId(),
      createdAt: new Date(),
    }
    dispatch({ type: 'ADD_SUGGESTION', payload: fullSuggestion })
  }, [])

  const acceptSuggestion = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_SUGGESTION', payload: { id, status: 'accepted' } })
  }, [])

  const rejectSuggestion = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_SUGGESTION', payload: { id, status: 'rejected' } })
  }, [])

  const updateLayout = useCallback((updates: Partial<WorkspaceLayout>) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: updates })
  }, [])

  const addPanel = useCallback((panel: Omit<DockPanel, 'id'>) => {
    const fullPanel: DockPanel = {
      ...panel,
      id: generateId(),
    }
    dispatch({ type: 'ADD_PANEL', payload: fullPanel })
  }, [])

  const updatePanel = useCallback((id: string, updates: Partial<DockPanel>) => {
    dispatch({ type: 'UPDATE_PANEL', payload: { id, updates } })
  }, [])

  const removePanel = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PANEL', payload: id })
  }, [])

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const value: WorkspaceContextValue = {
    state,
    actions: {
      setLoading,
      setError,
      setCurrentProject,
      addProject,
      updateProject,
      loadProjects,
      addMessage,
      addSuggestion,
      acceptSuggestion,
      rejectSuggestion,
      updateLayout,
      addPanel,
      updatePanel,
      removePanel,
    },
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}