'use client'

import { useWorkspace } from '@/hooks/use-workspace'
import { useWebSocket } from '@/hooks/use-websocket'
import { DashboardHeader } from './dashboard-header'
import { DockInterface } from './dock-interface'
import { FloatingPanels } from './floating-panels'
import { StatusBar } from './status-bar'
import { ProjectSelector } from './project-selector'
import { NewProjectDialog } from './new-project-dialog'
import { useState } from 'react'

export function Dashboard() {
  const { state } = useWorkspace()
  const { isConnected } = useWebSocket()
  const [showNewProject, setShowNewProject] = useState(false)

  return (
    <div className="min-h-screen cosmic-gradient flex flex-col">
      {/* Header */}
      <DashboardHeader 
        onNewProject={() => setShowNewProject(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Project Selector */}
        {!state.currentProject && (
          <div className="flex-center flex-1">
            <ProjectSelector onNewProject={() => setShowNewProject(true)} />
          </div>
        )}

        {/* Workspace Interface */}
        {state.currentProject && (
          <>
            <DockInterface />
            <FloatingPanels />
          </>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar 
        isConnected={isConnected}
        currentProject={state.currentProject}
      />

      {/* New Project Dialog */}
      <NewProjectDialog
        open={showNewProject}
        onOpenChange={setShowNewProject}
      />
    </div>
  )
}