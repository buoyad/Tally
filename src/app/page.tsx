import Link from 'next/link'
import { getLoggedInUser } from './lib/hooks'
import { Box, Subheading, Ordinal, TimeScore } from './ui/components'
import { getGlobalTopScores } from './lib/db'
import { PuzzleType } from './lib/types'
import { TimeScoreLarge } from './ui/client-components'
import { PodiumLeaderboard } from './stats'

export default async function Home() {
  const { session, userInfo } = await getLoggedInUser()
  const globalLeaderboard = await getGlobalTopScores(PuzzleType.mini)
  return (
    <main>
      <Box gap="large">
        {!!session && <p>Welcome, {userInfo.name}.</p>}
        <p>Tally is a score keeper for <a href="https://www.nytimes.com/crosswords" target="_blank">The New York Times mini crossword puzzle</a>.</p>
        <p><Link href="/tournaments">Browse tournaments</Link> or <Link href="/tournaments/create">create</Link> one of your own.</p>
        {!!session && <Subheading><Link href="/score">Register today&apos;s score</Link></Subheading>}
        <Subheading>Today&apos;s fastest mini solves</Subheading>
        <PodiumLeaderboard scores={globalLeaderboard} userInfo={userInfo} />
      </Box>
    </main>
  )
}
