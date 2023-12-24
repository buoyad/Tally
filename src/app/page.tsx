import Link from 'next/link'
import { Box, Subheading, Subtitle } from './ui/components'
import { PodiumLeaderboard, PodiumLeaderboardLoading } from './stats'
import { Suspense } from 'react'
import { GlobalTopPerformers, GlobalTopPerformersLoading, GlobalTopStreaks, GlobalTopStreaksLoading } from './sections'
import { styleSheet } from './ui/util'
import * as C from '@/app/lib/constants'
import { currentPuzzleDate, displayScoreDate } from './lib/util'
import Card from './ui/common/card'

export default function Home() {
  return (
    <main>
      <Box gap="large" style={styles.overflowVisible}>
        <p>Tally is a score keeper for <a href="https://www.nytimes.com/crosswords" target="_blank">The New York Times mini crossword puzzle</a>.</p>
        <p><Link href="/tournaments">Browse tournaments</Link> or <Link href="/tournaments/create">create</Link> one of your own.</p>
        <Subheading><Link href="/score">Register today&apos;s score</Link></Subheading>
        <Box>
          <Subheading>Fastest solves for {displayScoreDate(currentPuzzleDate())}</Subheading>
          <Subtitle>Contest ends at 10pm eastern time</Subtitle>
        </Box>
        <Suspense fallback={<PodiumLeaderboardLoading />}>
          <PodiumLeaderboard />
        </Suspense>

        <Box style={styles.gridContainer}>
          <Card>
            <Box>
              <Subheading>Fastest average</Subheading>
              <Subtitle>Users must have at least {C.mini.minScoresForGlobalRank} scores to appear in this list</Subtitle>
              <Suspense fallback={<GlobalTopPerformersLoading />}>
                <GlobalTopPerformers />
              </Suspense>
            </Box>
          </Card>
          <Card>
            <Box>
              <Subheading>Top streaks</Subheading>
              <Subtitle><br /></Subtitle>
              <Suspense fallback={<GlobalTopStreaksLoading />}>
                <GlobalTopStreaks />
              </Suspense>
            </Box>
          </Card>
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
    overflow: 'visible',
  },
  fullWidth: {
    gridColumn: '1 / -1'
  },
  overflowVisible: { overflow: 'visible' }
})
