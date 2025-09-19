'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useWorkspace } from '@/hooks/use-workspace'
import { 
  Zap, 
  Plus, 
  Settings, 
  User, 
  LogOut, 
  Wifi, 
  WifiOff,
  Save,
  Play
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWebSocket } from '@/hooks/use-websocket'
import { Badge } from '@/components/ui/badge'

interface DashboardHeaderProps {
  onNewProject: () => void
}

export function DashboardHeader({ onNewProject }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const { state, actions } = useWorkspace()
  const { isConnected, presenceUsers } = useWebSocket()

  const handleSave = async () => {
    if (!state.currentProject) return
    
    try {
      await fetch(`/api/projects/${state.currentProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.currentProject),
      })
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const handlePreview = () => {
    if (state.currentProject?.previewUrl) {
      window.open(state.currentProject.previewUrl, '_blank')
    }
  }

  return (
    <header className="h-16 border-b border-thor-border bg-cosmic-800/90 backdrop-blur-md">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side - Logo & Project */}
        <div className="flex items-center space-x-4">
          {/* Thor.dev Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-thor-400/20 thor-glow">
              <Zap className="h-5 w-5 text-thor-400" />
            </div>
            <div className="font-zentry text-xl font-black text-white">
              Thor<span className="text-thor-400">.dev</span>
            </div>
          </div>

          {/* Project Info */}
          {state.currentProject && (
            <div className="flex items-center space-x-3 pl-4 border-l border-thor-border">
              <div>
                <h2 className="font-medium text-white text-sm">
                  {state.currentProject.name}
                </h2>
                <p className="text-xs text-gray-400">
                  {state.currentProject.type} • {state.currentProject.status}
                </p>
              </div>
              <Badge 
                variant={state.currentProject.status === 'deployed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {state.currentProject.status}
              </Badge>
            </div>
          )}
        </div>

        {/* Center - Actions */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={onNewProject}
            variant="cosmic"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>

          {state.currentProject && (
            <>
              <Button
                onClick={handleSave}
                variant="outline"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button
                onClick={handlePreview}
                variant="lightning"
                size="sm"
                disabled={!state.currentProject.previewUrl}
              >
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </>
          )}
        </div>

        {/* Right Side - Status & User */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-400">
                <Wifi className="h-4 w-4" />
                <span className="text-xs font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-400">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs font-medium">Disconnected</span>
              </div>
            )}
          </div>

          {/* Presence Users */}
          {presenceUsers.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-2">
                {presenceUsers.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-6 w-6 border-2 border-cosmic-800">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {presenceUsers.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{presenceUsers.length - 3}
                </span>
              )}
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}