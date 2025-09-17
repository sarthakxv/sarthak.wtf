import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from './header'
import { Footer } from './footer'
import { ThemeProvider } from 'next-themes'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://sarthak.wtf/'),
  alternates: {
    canonical: '/'
  },
  title: {
    default: 'Sarthak Verma - Co-Founder & Engineer at Eido Labs',
    template: '%s | Sarthak Verma'
  },
  description: 'Co-Founder and Engineer at Eido Labs. Focused on creating intuitive and performant web experiences. Creator of Motion Primitives, bridging the gap between design and development.',
  keywords: [
    'Sarthak Verma',
    'Frontend Engineer',
    'Co-Founder',
    'Eido Labs',
    'Motion Primitives',
    'React Developer',
    'TypeScript',
    'Web Development',
    'UI/UX Design',
    'Design Engineering',
    'Portfolio',
    'Software Engineer'
  ],
  authors: [{ name: 'Sarthak Verma', url: 'https://sarthak.wtf' }],
  creator: 'Sarthak Verma',
  publisher: 'Sarthak Verma',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sarthak.wtf',
    title: 'Sarthak Verma - Co-Founder & Engineer at Eido Labs',
    description: 'Co-Founder and Engineer at Eido Labs. Focused on creating intuitive and performant web experiences. Creator of Motion Primitives, bridging the gap between design and development.',
    siteName: 'Sarthak Verma Portfolio',
    images: [
      {
        url: '/cover.png',
        width: 1200,
        height: 630,
        alt: 'Sarthak Verma - Portfolio Cover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarthak Verma - Co-Founder & Engineer at Eido Labs',
    description: 'Co-Founder and Engineer at Eido Labs. Focused on creating intuitive and performant web experiences. Creator of Motion Primitives.',
    creator: '@0xSarthak',
    images: ['/cover.png'],
  },
  category: 'Technology',
  classification: 'Portfolio Website',
};

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} bg-white tracking-tight antialiased dark:bg-zinc-950`}
      >
        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="system"
        >
          <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-inter-tight)]">
            <div className="relative mx-auto w-full max-w-screen-sm flex-1 px-4 pt-20">
              <Header />
              {children}
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
