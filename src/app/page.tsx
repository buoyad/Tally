import Link from 'next/link'
import { getLoggedInUser } from './lib/hooks'
import { Box, Subheading, Ordinal, TimeScore, Subtitle } from './ui/components'
import { getGlobalTopPerformers, getGlobalTopScores } from './lib/db'
import { PuzzleType } from './lib/types'
import { PodiumLeaderboard } from './stats'
import { Suspense } from 'react'
import { GlobalTopPerformers, GlobalTopPerformersLoading, GlobalTopStreaks, GlobalTopStreaksLoading } from './sections'

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
        <Box>
          <Subheading>Today&apos;s fastest mini solves</Subheading>
          <Subtitle>Contest ends at 10pm eastern time</Subtitle>
        </Box>
        <PodiumLeaderboard scores={globalLeaderboard} userInfo={userInfo} />

        <Box style={styles.gridContainer}>
          <Box>
            <Subheading>Fastest average</Subheading>
            <Subtitle>Users must have at least 10 scores to appear in this list</Subtitle>
            <Suspense fallback={<GlobalTopPerformersLoading />}>
              <GlobalTopPerformers />
            </Suspense>
          </Box>
          <Box>
            <Subheading>Top streaks</Subheading>
            <Subtitle><br /></Subtitle>
            <Suspense fallback={<GlobalTopStreaksLoading />}>
              <GlobalTopStreaks />
            </Suspense>
          </Box>
        </Box>
      </Box>
    </main>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    width: '100%',
  },
  fullWidth: {
    gridColumn: '1 / -1'
  },
}
