import Link from 'next/link'
import { getLoggedInUser } from './lib/hooks'
import { Box, Subheading, Ordinal, TimeScore } from './ui/components'
import { getGlobalScores } from './lib/db'
import { PuzzleType } from './lib/types'
import { TimeScoreLarge } from './ui/client-components'

export default async function Home() {
  const { session, userInfo } = await getLoggedInUser()
  const globalLeaderboard = await getGlobalScores(PuzzleType.mini)
  console.log(globalLeaderboard)
  return (
    <main>
      <Box gap="large">
        {!!session && <p>Welcome, {userInfo.name}.</p>}
        <p>Tally is a score keeper for <a href="https://www.nytimes.com/crosswords" target="_blank">The New York Times mini crossword puzzle</a>.</p>
        <p><Link href="/tournaments">Browse tournaments</Link> or <Link href="/tournaments/create">create</Link> one of your own.</p>
        {!!session && <Subheading><Link href="/score">Register today&apos;s score</Link></Subheading>}
        {/* <Box style={styles.container}>
          <Subheading style={styles.fullWidth}>Today&apos;s fastest mini solves</Subheading>
          {globalLeaderboard.length === 0 && <p style={styles.fullWidth}>No scores yet today</p>}
          {globalLeaderboard.length > 0 && [
            <Ordinal position={1} key={1} style={styles.firstPlaceText} />,
            <p style={styles.firstPlaceText} key={3}>{globalLeaderboard[0].user_name}{globalLeaderboard[0].user_id === userInfo?.id ? ` 🎉🎉🎉` : ''}</p>,
            <TimeScoreLarge score={globalLeaderboard[0].score} key={2} placeholder={['🥁', '🥁', '🥁']} />,
          ]}
          {globalLeaderboard.slice(1).flatMap((s, idx) => [
            <Ordinal position={idx + 2} key={`ordinal-${idx}`} />,
            <p key={`name=${idx}`}>{s.user_name}</p>,
            <TimeScore score={s.score} key={`score-${idx}`} />,
          ])}
        </Box> */}
      </Box>
    </main>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'grid',
    gridTemplateColumns: '.25fr 1fr 1fr',
    gap: '.5rem',
    width: '100%',
    alignItems: 'center',
    justifyItems: 'start',
  },
  firstPlaceText: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  justifySelfStart: { justifySelf: 'start' },
  fullWidth: {
    gridColumn: '1 / -1',
    justifySelf: 'start',
  },
  divider: {
    gridColumn: '1 / -1',
    backgroundColor: 'black',
    height: '1px',
    width: '50%',
  },
  fontWeightBold: {
    fontWeight: 'bold'
  }
}
