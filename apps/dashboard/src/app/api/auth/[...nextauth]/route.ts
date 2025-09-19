import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { MockEmailService } from '@/lib/mock-services'

// Check if we have real OAuth credentials
const hasGoogleAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
const hasEmailAuth = process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER

const providers = []

// Add Google OAuth if credentials are available
if (hasGoogleAuth) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  )
}

// Add Email provider if credentials are available
if (hasEmailAuth) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    })
  )
} else {
  // Add mock email provider for development
  providers.push(
    EmailProvider({
      server: 'smtp://localhost:1025', // Mock SMTP server
      from: process.env.EMAIL_FROM || 'noreply@thor.dev',
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // Use mock email service
        await MockEmailService.sendMagicLink(identifier, url)
      },
    })
  )
}

// Always add guest/demo provider for immediate access
providers.push(
  CredentialsProvider({
    id: 'guest',
    name: 'Guest Access',
    credentials: {},
    async authorize() {
      // Create or find guest user
      let guestUser = await prisma.user.findUnique({
        where: { email: 'guest@thor.dev' },
      })
      
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: 'guest@thor.dev',
            name: 'Guest User',
          },
        })
      }
      
      return {
        id: guestUser.id,
        email: guestUser.email,
        name: guestUser.name,
        image: null,
      }
    },
  })
)

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'database',
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }