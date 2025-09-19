import { Dashboard } from '@/components/dashboard/dashboard'
import { AuthWrapper } from '@/components/auth/auth-wrapper'

export default function HomePage() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  )
}