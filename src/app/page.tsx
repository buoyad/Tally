import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from './api/auth/[...nextauth]/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const loggedIn = !!(session?.user)
  let userEmail = ''
  if (loggedIn) {
    userEmail = session.user!.email || ''
  }
  return (
    <main>
      <p>Tally is a score keeper for the <a href="https://www.nytimes.com/crosswords/game/mini" target="_blank">New York Times Mini Crossword</a>.</p>
      <p><Link href="/login">Log in</Link> or <Link href="/tournaments">browse</Link> tournaments&apos; scores.</p>
      {loggedIn && <p>You are logged in as {userEmail}.</p>}
    </main>
  )
}
