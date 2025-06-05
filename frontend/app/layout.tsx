import './globals.css'

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { ThemeProvider } from '@/components/theme-provider'
import { Web3Provider } from '@/providers/web3-provider'
import { cn } from '@/lib/utils'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  height: 'device-height',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ]
}

export const metadata: Metadata = {
  metadataBase: new URL('https://github.com/armsves/xSollaTetris'),
  title: 'XSollaTetris - Modern Puzzle Game',
  description: 'A modern take on classic block-falling puzzle games',
  keywords: ['puzzle game', 'block game', 'tetris-like', 'web game'],
  authors: [{ name: 'Noppakorn Kaewsalabnil' }, { name: 'PunGrumpy' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'XSollaTetris',
    title: 'XSollaTetris - Modern Puzzle Game',
    description: 'A modern take on classic block-falling puzzle games',
    images: [
      {
        url: '/og-image.png',
        width: 800,
        height: 400,
        alt: 'XSollaTetris - Modern Puzzle Game'
      }
    ]
  },
  twitter: {
    site: '@pungrumpy',
    creator: '@pungrumpy',
    card: 'summary_large_image',
    title: 'XSollaTetris - Modern Puzzle Game',
    description: 'A modern take on classic block-falling puzzle games',
    images: [
      {
        url: '/twitter-card.png',
        width: 800,
        height: 400,
        alt: 'XSollaTetris - Modern Puzzle Game'
      }
    ]
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-screen scroll-smooth antialiased'
        )}
      >
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <main className="bg-background text-foreground">{children}</main>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
