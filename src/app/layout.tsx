import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import Nav from './nav'
import './globals.css'

const lora = Lora({ subsets: ['latin'] }) // TODO: try some other options https://fonts.google.com/?stroke=Serif&vfonly=true&preview.text=Tally

export const metadata: Metadata = {
  title: 'Tally',
  description: 'Track your crossword times.',
  metadataBase: new URL('https://tally.ayoubd.com')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={lora.className}>
        <header>Tally 🏁</header>
        <Nav />
        {children}
      </body>
    </html>
  )
}
