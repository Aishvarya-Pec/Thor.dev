import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Thor.dev - Multi-Agent Workspace',
  description: 'Build epic projects with Designer AI, Coder AI, Tester AI, and Deployer AI',
  keywords: ['thor.dev', 'multi-agent', 'workspace', 'nextjs', 'ai', 'code-generation', 'deployment'],
  authors: [{ name: 'Thor.dev Team' }],
  openGraph: {
    title: 'Thor.dev - Multi-Agent Workspace',
    description: 'Build epic projects with Designer AI, Coder AI, Tester AI, and Deployer AI',
    type: 'website',
    url: 'https://thor.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thor.dev - Multi-Agent Workspace',
    description: 'Build epic projects with Designer AI, Coder AI, Tester AI, and Deployer AI',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#5724ff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/fonts/zentry-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/general.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/circular-web.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}