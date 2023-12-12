import { PuzzleType, Score, UserInfo } from "@/app/lib/types"
import { Box, Subheading, TimeScore, Ordinal, Subtitle, LoadingIndicator, Username } from "@/app/ui/components"
import dayjs from 'dayjs'
import isTodaysContest from './isTodaysContest'
import Link from "next/link"
import { Podium } from "./client"
import { getGlobalTopScores } from "../lib/db"
import { styleSheet } from "../ui/util"

dayjs.extend(isTodaysContest)

type LeaderboardTodayProps = {
    scores: Score[],
    usersByID: { [key: number]: { id: number, name: string } },
    loggedInUser: UserInfo | null,
    currentUserIsParticipant: boolean,
}

export function LeaderboardToday({ scores, usersByID, loggedInUser, currentUserIsParticipant }: LeaderboardTodayProps) {
    const todayScores = scores.filter(s => dayjs(s.for_day).isTodaysContest())

    const children = []

    children.push(<Subtitle key="subtitle" style={styles.fullWidth}>
        Contest ends at 10PM eastern time
    </Subtitle>)

    if (todayScores.length === 0) {
        children.push(<p key="no-scores" style={styles.fullWidth}>No scores yet today</p>)
    }

    const currentUserHasSubmittedScore = todayScores.some(s => s.user_id === loggedInUser?.id)
    if (todayScores.length > 0) {
        children.push(
            <p key="empty-heading" />,
            <Subheading key="name-heading">Contestant</Subheading>,
            <Subheading key="score-heading">Score</Subheading>,
            todayScores.flatMap((s, idx) => [
                <Ordinal key={`rank-${s.id}`} position={idx + 1} />,
                <Username key={`name-${s.id}`} style={s.user_id === loggedInUser?.id ? styles.fontWeightBold : {}} name={usersByID[s.user_id].name} />,
                <TimeScore key={`score-${s.id}`} score={s.score} />,
            ])
        )

        const winner = todayScores[0]
        const currentUserWins = winner.user_id === loggedInUser?.id
        let message = ""
        if (todayScores.length === 1) {
            if (currentUserWins) {
                message = "You win! Your victory is tempered only by the fact that you are the only one who submitted a score today."
            } else {
                message = `${usersByID[winner.user_id].name} wins! Their victory is tempered only by the fact that they are the only one who submitted a score today.`
            }
        } else if (todayScores.length === Object.keys(usersByID).length) {
            if (currentUserWins) {
                message = "You win!! 🎉🎊🍾"
            } else {
                message = `${usersByID[winner.user_id].name} wins!`
            }
        } else {
            if (currentUserWins) {
                message = "You win! For now..."
            } else {
                message = `${usersByID[winner.user_id].name} wins! For now...`
            }
        }
        children.push(<p key="winner-message" style={styles.fullWidth}>{message}</p>)
        if (currentUserIsParticipant && !currentUserHasSubmittedScore) {
            children.push(<p key="submit-score" style={styles.fullWidth}><Link href="/score">Submit your score! Unseat {usersByID[winner.user_id].name}!</Link></p>)
        }
    } else if (currentUserIsParticipant && !currentUserHasSubmittedScore) {
        children.push(<p key="submit-score" style={styles.fullWidth}><Link href="/score">Submit your score!</Link></p>)
    }


    return <Box style={{ width: '100%' }}>
        <div style={styles.container}>
            {children}
        </div>
    </Box>
}

export async function PodiumLeaderboard() {
    let scores = await getGlobalTopScores(PuzzleType.mini)
    scores = Array(10).fill({ user_name: 'ayoub', score: 100, id: 1, user_id: 1, for_day: 'a', puzzle_type: PuzzleType.mini })
    return (
        <Box style={{ ...styles.container, ...styles.whiteSpaceNowrap }}>
            {scores.length === 0 && <p style={styles.fullWidth}>No scores yet today</p>}
            {scores.length > 0 && <div style={styles.fullWidth}><Podium scores={scores} /></div>}
            {scores.slice(3).flatMap((s, idx) => [
                <Ordinal position={idx + 4} key={`ordinal-${idx}`} />,
                <Username key={`name=${idx}`} style={styles.username} name={s.user_name} />,
                <TimeScore score={s.score} key={`score-${idx}`} />,
            ])}
        </Box>)
}

export function PodiumLeaderboardLoading() {
    return (
        <Box style={styles.loadingContainer}>
            <LoadingIndicator size="large" />
        </Box>)
}

const styles = styleSheet({
    container: {
        display: 'grid',
        gridTemplateColumns: '.5fr 3fr 1fr',
        gap: '.5rem',
        width: '100%',
        alignItems: 'baseline',
        justifyItems: 'start'
    },
    loadingContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    whiteSpaceNowrap: {
        whiteSpace: 'nowrap'
    },
    justifySelfStart: { justifySelf: 'start' },
    fullWidth: {
        gridColumn: '1 / -1',
        justifySelf: 'start',
        width: '100%',
    },
    fontWeightBold: {
        fontWeight: 'bold'
    },
    username: {
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
})