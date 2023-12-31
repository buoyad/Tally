import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import Nav from './nav'
import Footer from './footer'
import './globals.css'
import { getLoggedInUser } from './lib/hooks'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SetInitialColors } from './ui/dark-mode'
import { ThemeProvider } from './ui/theme-context'

const lora = Lora({ subsets: ['latin'] }) // TODO: try some other options https://fonts.google.com/?stroke=Serif&vfonly=true&preview.text=Tally

export const metadata: Metadata = {
  metadataBase: new URL('https://tally.ayoubd.com'),
  title: 'Tally',
  description: 'Score and competition tracker for crossword puzzles.',
  applicationName: 'Tally',
  authors: { name: 'Danny Ayoub', url: 'https://ayoubd.com' },
  keywords: ['crossword', 'scorekeeper', 'competition', 'mini crossword', 'mini crossword puzzle', 'puzzle', 'game', 'tally', 'crossword puzzle', 'crossword puzzles', 'crossword puzzle competition', 'crossword puzzle game', 'crossword puzzle scorekeeper', 'crossword puzzle competition score'],
  creator: 'Danny Ayoub',
  alternates: { canonical: 'https://tally.ayoubd.com' },
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    url: 'https://tally.ayoubd.com',
    title: 'Tally',
    description: 'Score and competition tracker for crossword puzzles.',
    siteName: 'Tally',
    images: [
      { url: '/og.png', alt: 'Tally logo, which is a 2x2 grid section of a crossword puzzle, with the bottom right square filled in black, and the top left square filled with the capital letter T.' },
    ],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, userInfo } = await getLoggedInUser()
  return (
    <html lang="en">
      <head>
        <SetInitialColors />
      </head>
      <body className={lora.className}>
        <ThemeProvider>
          <Nav userInfo={userInfo} />
          {children}
          <Footer />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
