import React from 'react'
import { Box, Heading, Subheading, TimeScore } from '@/app/ui/components'
import { ChangeUsernameForm, LogoutButton, InviteRow, ScoreTable, Message } from './form'
import { getLoggedInUser } from '../lib/hooks'
import { getUserTournaments, getUserInvites, getUserScores, getUserStats, getUserStreak } from '../lib/db'
import Link from 'next/link'
import { PuzzleType } from '../lib/types'
import { AnimatedCounter } from '../stats/client'
import { displayScoreDate } from '../lib/util'

export default async function Page({ searchParams }: { searchParams?: any }) {
    const { session, userInfo } = await getLoggedInUser(true)
    if (!session) return null
    const tournaments = await getUserTournaments(userInfo.id)
    const invites = await getUserInvites(userInfo.email)
    const scores = await getUserScores(userInfo.id)

    const userStats = await getUserStats(userInfo.id)
    const miniStats = userStats.mini
    let avg, recentAvg, hasTrends, percentChange, percentChangeSign
    if (miniStats) {
        avg = miniStats.avg; recentAvg = miniStats.recentAvg, hasTrends = miniStats.hasTrends;
        if (hasTrends) {
            percentChange = ((avg - recentAvg) / avg) * 100
            percentChangeSign = percentChange > 0 ? 'pos' : 'neg'
            percentChange = Math.abs(percentChange)
        }
    }
    const hasMiniStats = !!avg

    const streaks = await getUserStreak(userInfo.id, PuzzleType.mini)
    const currentMiniStreak = streaks.find(s => s.current)
    const maxMiniStreak = streaks.find(s => !s.current) || currentMiniStreak

    return <main style={styles.container}>
        <Message userInfo={userInfo} />
        <Box style={styles.fullWidth}>
            <Heading>My account</Heading>
            <p>Welcome back {userInfo.name}</p>
        </Box>
        {hasMiniStats && <>
            <Box>
                <Subheading>Average score on the mini</Subheading>
                <TimeScore large={true} score={avg!} />
            </Box>
            <Box>
                <Subheading>Trends</Subheading>
                {!hasTrends && <p>Keep logging scores to calculate trends.</p>}
                {hasTrends &&
                    <p>Over the last week, your average solve time was <TimeScore score={recentAvg || 0} />, which is {' '}
                        {percentChange?.toFixed(1)}% {percentChangeSign === 'pos' ? <strong>faster</strong> : <strong>slower</strong>} than your lifetime average.</p>}
            </Box>
            <Box>
                <Subheading>Current streak</Subheading>
                <Box row={true} style={{ alignItems: 'baseline' }}>
                    <AnimatedCounter value={currentMiniStreak?.length ?? 0} />
                    <p>{currentMiniStreak?.length === 1 ? 'day' : 'days'}</p>
                </Box>
                {!currentMiniStreak && <p>Get a streak going!</p>}
                {currentMiniStreak && <p>started on {displayScoreDate(currentMiniStreak.start_date)}</p>}
            </Box>
            <Box>
                <Subheading>Longest streak</Subheading>
                <Box row={true} style={{ alignItems: 'baseline' }}>
                    <AnimatedCounter value={(maxMiniStreak?.length || currentMiniStreak?.length) ?? 0} />
                    <p>days</p>
                </Box>
                {maxMiniStreak && maxMiniStreak.length !== currentMiniStreak?.length && <p>{displayScoreDate(maxMiniStreak.start_date)} - {displayScoreDate(maxMiniStreak.end_date)}</p>}
                {maxMiniStreak?.length === currentMiniStreak?.length && <p>You&apos;re in your longest streak! Keep it going!</p>}
            </Box>
        </>}
        <Box>
            <Subheading>Tournaments</Subheading>
            {tournaments.length === 0 && <p>None yet. <Link href="/tournaments/create">Make one now!</Link></p>}
            {tournaments.map(t => <p key={t.id}><Link href={`/tournaments/${t.name}`}>{t.name}</Link></p>)}
        </Box>
        <Box>
            <Subheading>Invites</Subheading>
            {invites.length === 0 && <p>None yet.</p>}
            {invites.map(i => <InviteRow key={i.id} inviterName={i.inviter_name} tournamentName={i.tournament_name} id={i.id} userID={userInfo.id} />)}
        </Box>
        <Box>
            <Box row={true} gap="large">
                <Subheading>Recent scores</Subheading>
                <Link href="/score">Add</Link>
            </Box>
            <ScoreTable scores={scores.slice(0, 10)} userID={userInfo.id} />
        </Box>
        <Box>
            <ChangeUsernameForm id={userInfo.id} username={userInfo.name} />
        </Box>
        <Box>
            <LogoutButton />
        </Box>
    </main>
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
    },
    fullWidth: {
        gridColumn: '1 / -1'
    },
}
