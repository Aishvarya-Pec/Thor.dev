'use client'

import { useSession } from 'next-auth/react'
import { AuthScreen } from './auth-screen'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex-center cosmic-gradient">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  return <>{children}</>
}