import React from 'react'
import { Box, Heading, Subheading, Subtitle, TimeScore } from '@/app/ui/components'
import { ScoreBoxPlot } from '@/app/ui/common'
import { ChangeUsernameForm, LogoutButton, InviteRow, ScoreTable, Message } from './form'
import { getLoggedInUser } from '../lib/hooks'
import { getUserTournaments, getUserInvites, getUserScores, getUserStats, getUserStreak, getUserByName } from '../lib/db'
import Link from 'next/link'
import { PuzzleType, UserInfo } from '../lib/types'
import { AnimatedCounter } from '../stats/client'
import { displayScoreDate } from '../lib/util'
import { styleSheet } from '../ui/util'
import { AnimatedText } from '../ui/client-components'
import { Tilt_Warp } from 'next/font/google'
import * as C from '@/app/lib/constants'

const largeFont = Tilt_Warp({ subsets: ['latin'], weight: '400' })

export default async function Page({ searchParams, params }: { searchParams?: any, params: { user: string } }) {
    const { userInfo } = await getLoggedInUser()

    let userPageInfo: UserInfo | undefined
    let isMe = false
    if (userInfo?.name.toLowerCase() === params.user.toLowerCase()) {
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
    let percentChange, percentChangeSign
    if (miniStats) {
        if (miniStats.hasTrends) {
            percentChange = ((miniStats.avg - miniStats.recentAvg) / miniStats.avg) * 100
            percentChangeSign = percentChange > 0 ? 'pos' : 'neg'
            percentChange = Math.abs(percentChange)
        }
    }

    const streaks = await getUserStreak(userPageInfo.id, PuzzleType.mini)
    const currentMiniStreak = streaks.find(s => s.current)
    const maxMiniStreak = streaks.find(s => !s.current) || currentMiniStreak

    return <main style={styles.container}>
        <Message userInfo={userInfo} />
        <Box style={styles.fullWidth}>
            <Heading>{userPageInfo.name}</Heading>
        </Box>
        {miniStats && <>
            <Box>
                <Subheading>Average score on the mini</Subheading>
                <TimeScore large={true} score={miniStats.avg} />
            </Box>
            <Box>
                <Subheading>Trends</Subheading>
                {!miniStats.hasTrends && <p>Keep logging scores to calculate trends.</p>}
                {miniStats.hasTrends &&
                    <p>Past 7 days:
                        average solve time was <TimeScore score={miniStats.recentAvg} />,{' '}
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
            <Box style={{ overflow: 'visible' }}>
                <Subheading>The juicy math</Subheading>
                {scores.length > 4 && <ScoreBoxPlot scores={scores} />}
                {scores.length <= 4 && <p>Need at least 5 scores to do juicy math</p>}
            </Box>
            <Box>
                <Subheading>Completion rate</Subheading>
                <AnimatedText className={largeFont.className} placeholder={['0', '0', '.', '0', '0', '%']} style={{ fontSize: '64px' }}>{(miniStats.completionRate * 100).toFixed(2) + '%'}</AnimatedText>
                <p>{miniStats.totalScores} completed / {miniStats.daysSinceFirstPlay} days since first submitted score</p>
            </Box>
            <Box>
                <Subheading>Best score</Subheading>
                <TimeScore large={true} score={miniStats.minScore} />
            </Box>
            <Box>
                <Subheading>Global ranking</Subheading>
                {!miniStats.hasGlobalRank && <>
                    <Subtitle>Must have at least {C.mini.minScoresForGlobalRank} scores to compete in site-wide ranking</Subtitle>
                    <AnimatedText className={largeFont.className} style={{ fontSize: '64px' }} placeholder={['#', '0', '0']}>N/A</AnimatedText>
                </>}
                {miniStats.hasGlobalRank && <>
                    <Subtitle>by average score out of {miniStats.maxGlobalRank} {miniStats.maxGlobalRank === 1 ? 'player' : 'players'}</Subtitle>
                    <AnimatedText className={largeFont.className} style={{ fontSize: '64px' }} placeholder={['#', '0', '0']}>{'#' + miniStats.globalRank}</AnimatedText>
                </>
                }
            </Box>
        </>}
        <Box>
            <Subheading>Tournaments</Subheading>
            {tournaments.length === 0 && <p>None yet. <Link href="/tournaments/create">Make one now!</Link></p>}
            {tournaments.map(t => <p key={t.id}><Link href={`/tournaments/${t.name}`}>{t.name}</Link></p>)}
        </Box>
        {userInfo && isMe && <Box>
            <Subheading>Invites</Subheading>
            {invites.length === 0 && <p>None yet.</p>}
            {invites.map(i => <InviteRow key={i.id} inviterName={i.inviter_name} tournamentName={i.tournament_name} id={i.id} userID={userInfo.id} />)}
        </Box>}
        <Box>
            <Box row={true} gap="large">
                <Subheading>Recent scores</Subheading>
                {isMe && <Link href="/score">Add</Link>}
            </Box>
            <ScoreTable scores={scores.slice(0, 10)} userID={userPageInfo.id} isMe={isMe} />
        </Box>
        {userInfo && isMe && <>
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
