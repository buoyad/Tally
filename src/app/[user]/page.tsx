import React from 'react'
import { Box, Heading, Subheading, TimeScore } from '@/app/ui/components'
import { ChangeUsernameForm, LogoutButton, InviteRow, ScoreTable, Message } from './form'
import { getLoggedInUser } from '../lib/hooks'
import { getUserTournaments, getUserInvites, getUserScores, getUserStats, getUserStreak, getUserByName } from '../lib/db'
import Link from 'next/link'
import { PuzzleType, UserInfo } from '../lib/types'
import { AnimatedCounter } from '../stats/client'
import { displayScoreDate } from '../lib/util'
import { styleSheet } from '../ui/util'

export default async function Page({ searchParams, params }: { searchParams?: any, params: { user: string } }) {
    const { session, userInfo } = await getLoggedInUser()
    if (!session) return null

    let userPageInfo: UserInfo | undefined
    let isMe = false
    if (userInfo.name.toLowerCase() === params.user.toLowerCase()) {
        userPageInfo = userInfo
        isMe = true
    } else {
        userPageInfo = await getUserByName(params.user)
    }

    if (!userPageInfo) return (
        <main>
            <Heading>That user doesn&apos;t exist</Heading>
        </main>
    )

    const tournaments = await getUserTournaments(userPageInfo.id)
    const invites = await getUserInvites(userPageInfo.email)
    const scores = await getUserScores(userPageInfo.id)

    const userStats = await getUserStats(userPageInfo.id)
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

    const streaks = await getUserStreak(userPageInfo.id, PuzzleType.mini)
    const currentMiniStreak = streaks.find(s => s.current)
    const maxMiniStreak = streaks.find(s => !s.current) || currentMiniStreak

    return <main style={styles.container}>
        <Message userInfo={userInfo} />
        <Box style={styles.fullWidth}>
            <Heading>{userPageInfo.name}{isMe ? ' (me)' : ''}</Heading>
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
                    <p>Past 7 days:
                        average solve time was <TimeScore score={recentAvg!} />,{' '}
                        {percentChange?.toFixed(1)}% {percentChangeSign === 'pos' ? <strong>faster</strong> : <strong>slower</strong>}{' '}
                        than lifetime average.</p>}
            </Box>
            <Box>
                <Subheading>Current streak</Subheading>
                <Box row={true} style={{ alignItems: 'baseline' }}>
                    <AnimatedCounter value={currentMiniStreak?.length ?? 0} />
                    <p>{currentMiniStreak?.length === 1 ? 'day' : 'days'}</p>
                </Box>
                {!currentMiniStreak && isMe && <p>Get a streak going!</p>}
                {currentMiniStreak && <p>started on {displayScoreDate(currentMiniStreak.start_date)}</p>}
            </Box>
            <Box>
                <Subheading>Longest streak</Subheading>
                <Box row={true} style={{ alignItems: 'baseline' }}>
                    <AnimatedCounter value={(maxMiniStreak?.length || currentMiniStreak?.length) ?? 0} />
                    <p>days</p>
                </Box>
                {maxMiniStreak && maxMiniStreak.length !== currentMiniStreak?.length && <p>{displayScoreDate(maxMiniStreak.start_date)} - {displayScoreDate(maxMiniStreak.end_date)}</p>}
            </Box>
        </>}
        <Box>
            <Subheading>Tournaments</Subheading>
            {tournaments.length === 0 && <p>None yet. <Link href="/tournaments/create">Make one now!</Link></p>}
            {tournaments.map(t => <p key={t.id}><Link href={`/tournaments/${t.name}`}>{t.name}</Link></p>)}
        </Box>
        {isMe && <Box>
            <Subheading>Invites</Subheading>
            {invites.length === 0 && <p>None yet.</p>}
            {invites.map(i => <InviteRow key={i.id} inviterName={i.inviter_name} tournamentName={i.tournament_name} id={i.id} userID={userPageInfo!.id} />)}
        </Box>}
        <Box>
            <Box row={true} gap="large">
                <Subheading>Recent scores</Subheading>
                {isMe && <Link href="/score">Add</Link>}
            </Box>
            <ScoreTable scores={scores.slice(0, 10)} userID={userPageInfo.id} isMe={isMe} />
        </Box>
        {isMe && <>
            <Box>
                <ChangeUsernameForm id={userInfo.id} username={userInfo.name} />
            </Box>
            <Box>
                <LogoutButton />
            </Box>
        </>}
    </main>
}

const styles = styleSheet({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
    },
    fullWidth: {
        gridColumn: '1 / -1'
    },
})
