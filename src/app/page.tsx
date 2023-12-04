import Link from 'next/link'
import { getLoggedInUser } from './lib/hooks'
import { Box, Subheading } from './ui/components'

export default async function Home() {
  const { session, userInfo } = await getLoggedInUser()
  return (
    <main>
      <Box>
        {!!session && <p>Welcome, {userInfo.name}.</p>}
        <p>Tally is a score keeper for <a href="https://www.nytimes.com/crosswords" target="_blank">The New York Times mini crossword puzzle</a>.</p>
        <p><Link href="/tournaments">Browse tournaments</Link> or <Link href="/tournaments/create">create</Link> one of your own.</p>
        {!!session && <Subheading><Link href="/score">Register today&apos;s score</Link></Subheading>}
      </Box>
    </main>
  )
}
