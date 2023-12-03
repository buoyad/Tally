import Link from 'next/link'
import { getLoggedInUser } from './lib/hooks'

export default async function Home() {
  const { session, userInfo } = await getLoggedInUser()
  return (
    <main>
      {!!session && <p>Welcome, {userInfo.name}</p>}
      <p>Tally is a score keeper for the <a href="https://www.nytimes.com/crosswords/game/mini" target="_blank">New York Times Mini Crossword</a>.</p>
      <p>{!!session ? <Link href="/user">Edit your profile</Link> : <Link href="/login">Log in</Link>}
        {' '}or <Link href="/tournaments">browse</Link> tournaments&apos; scores.</p>
    </main>
  )
}
