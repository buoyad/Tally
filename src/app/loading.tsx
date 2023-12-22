import Link from 'next/link'
import { Box, LoadingIndicator, Subheading, Subtitle } from './ui/components'
import { styleSheet } from './ui/util'
import { currentPuzzleDate, displayScoreDate } from './lib/util'

export default function Loading() {
  return (
    <main>
      <Box gap="large">
        <p>Tally is a score keeper for <a href="https://www.nytimes.com/crosswords" target="_blank">The New York Times mini crossword puzzle</a>.</p>
        <p><Link href="/tournaments">Browse tournaments</Link> or <Link href="/tournaments/create">create</Link> one of your own.</p>
        <Subheading><Link href="/score">Register today&apos;s score</Link></Subheading>
        <Box>
          <Subheading>Fastest solves for {displayScoreDate(currentPuzzleDate())}</Subheading>
          <Subtitle>Contest ends at 10pm eastern time</Subtitle>
        </Box>
        <Box row={true} style={styles.loadingContainer}>
          <LoadingIndicator size="large" />
        </Box>
      </Box>
    </main>
  )
}

const styles = styleSheet({
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  }
})
