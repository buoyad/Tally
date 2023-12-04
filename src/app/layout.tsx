import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import Nav from './nav'
import Footer from './footer'
import './globals.css'
import { getLoggedInUser } from './lib/hooks'

const lora = Lora({ subsets: ['latin'] }) // TODO: try some other options https://fonts.google.com/?stroke=Serif&vfonly=true&preview.text=Tally

export const metadata: Metadata = {
  title: 'Tally',
  description: 'Track your crossword times.',
  metadataBase: new URL('https://tally.ayoubd.com')
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, userInfo } = await getLoggedInUser()
  return (
    <html lang="en">
      <body className={lora.className}>
        <Nav userInfo={userInfo} />
        {children}
        <Footer />
      </body>
    </html>
  )
}
