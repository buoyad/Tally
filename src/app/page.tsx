import Link from 'next/link'
import { Box, Subheading, Subtitle } from './ui/components'
import { PodiumLeaderboard, PodiumLeaderboardLoading } from './stats'
import { Suspense } from 'react'
import { GlobalTopPerformers, GlobalTopPerformersLoading, GlobalTopStreaks, GlobalTopStreaksLoading } from './sections'
import { styleSheet } from './ui/util'
import * as C from '@/app/lib/constants'

export default function Home() {
  return (
    <main>
      <Box gap="large">
        <p>Tally is a score keeper for <a href="https://www.nytimes.com/crosswords" target="_blank">The New York Times mini crossword puzzle</a>.</p>
        <p><Link href="/tournaments">Browse tournaments</Link> or <Link href="/tournaments/create">create</Link> one of your own.</p>
        <Subheading><Link href="/score">Register today&apos;s score</Link></Subheading>
        <Box>
          <Subheading>Today&apos;s fastest mini solves</Subheading>
          <Subtitle>Contest ends at 10pm eastern time</Subtitle>
        </Box>
        <Suspense fallback={<PodiumLeaderboardLoading />}>
          <PodiumLeaderboard />
        </Suspense>

        <Box style={styles.gridContainer}>
          <Box>
            <Subheading>Fastest average</Subheading>
            <Subtitle>Users must have at least {C.mini.minScoresForGlobalRank} scores to appear in this list</Subtitle>
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

const styles = styleSheet({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    width: '100%',
  },
  fullWidth: {
    gridColumn: '1 / -1'
  },
})
