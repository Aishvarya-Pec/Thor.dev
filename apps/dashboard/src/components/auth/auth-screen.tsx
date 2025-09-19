'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Mail, Github, Zap } from 'lucide-react'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const result = await signIn('email', { 
        email, 
        redirect: false,
        callbackUrl: '/' 
      })
      
      if (result?.ok) {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Email sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Google sign in error:', error)
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex-center cosmic-gradient">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex-center mb-4">
              <div className="p-3 rounded-full bg-thor-400/20 thor-glow">
                <Mail className="h-6 w-6 text-thor-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex-center cosmic-gradient">
      <div className="w-full max-w-md mx-4 space-y-8">
        {/* Thor.dev Branding */}
        <div className="text-center space-y-4">
          <div className="flex-center">
            <div className="p-4 rounded-full bg-thor-400/20 thor-glow-strong animate-float">
              <Zap className="h-12 w-12 text-thor-400" />
            </div>
          </div>
          <h1 className="font-zentry text-4xl font-black text-white">
            Thor<span className="text-thor-400">.dev</span>
          </h1>
          <p className="text-lg text-gray-300 font-general">
            Multi-Agent Workspace for Epic Projects
          </p>
          <p className="text-sm text-gray-400">
            Build with Designer AI, Coder AI, Tester AI, and Deployer AI
          </p>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Thor.dev</CardTitle>
            <CardDescription>
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-thor-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-cosmic-800 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Email Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !email}
                variant="lightning"
                className="w-full"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-gray-400">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-thor-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-thor-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-thor-border">
            <div className="text-thor-400 text-2xl font-bold">4</div>
            <div className="text-sm text-gray-400">AI Agents</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-thor-border">
            <div className="text-lightning-400 text-2xl font-bold">∞</div>
            <div className="text-sm text-gray-400">Projects</div>
          </div>
        </div>
      </div>
    </div>
  )
}