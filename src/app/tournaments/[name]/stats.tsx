import { Score, UserInfo } from "@/app/lib/types"
import { Box, Subheading, TimeScore } from "@/app/ui/components"
import formStyles from '@/app/ui/form.module.css'
import dayjs, { PluginFunc } from 'dayjs'
import isTodaysContest from './isTodaysContest'
import Link from "next/link"

dayjs.extend(isTodaysContest)

type LeaderboardTodayProps = {
    scores: Score[],
    usersByID: { [key: number]: { id: number, name: string } },
    loggedInUser: UserInfo | null,
    currentUserIsParticipant: boolean,
}

const Ordinal = ({ position }: { position: number }) => {
    let suffix: string
    switch (position) {
        case 1:
            suffix = 'st'
            break
        case 2:
            suffix = 'nd'
            break
        case 3:
            suffix = 'rd'
            break
        default:
            suffix = 'th'
    }
    return <p style={{}}>{position}<sup>{suffix}</sup></p>
}

export function LeaderboardToday({ scores, usersByID, loggedInUser, currentUserIsParticipant }: LeaderboardTodayProps) {
    const todayScores = scores.filter(s => dayjs(s.for_day).isTodaysContest())

    const children = []

    children.push(<p key="subtitle" className={formStyles.subtitle} style={scoreTableStyles.fullWidth}>
        Contest ends at 10PM eastern time
    </p>)

    if (todayScores.length === 0) {
        children.push(<p key="no-scores" style={scoreTableStyles.fullWidth}>No scores yet today</p>)
    }

    const currentUserHasSubmittedScore = todayScores.some(s => s.user_id === loggedInUser?.id)
    if (todayScores.length > 0) {
        children.push(
            <p key="empty-heading" />,
            <Subheading key="name-heading">Contestant</Subheading>,
            <Subheading key="score-heading">Score</Subheading>,
            todayScores.flatMap((s, idx) => [
                <Ordinal key={`rank-${s.id}`} position={idx + 1} />,
                <p key={`name-${s.id}`} style={s.user_id === loggedInUser?.id ? scoreTableStyles.fontWeightBold : {}}>{usersByID[s.user_id].name}</p>,
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
        children.push(<p key="winner-message" style={scoreTableStyles.fullWidth}>{message}</p>)
        if (currentUserIsParticipant && !currentUserHasSubmittedScore) {
            children.push(<p key="submit-score" style={scoreTableStyles.fullWidth}><Link href="/score">Submit your score! Unseat {usersByID[winner.user_id].name}!</Link></p>)
        }
    } else if (currentUserIsParticipant && !currentUserHasSubmittedScore) {
        children.push(<p key="submit-score" style={scoreTableStyles.fullWidth}><Link href="/score">Submit your score!</Link></p>)
    }


    return <Box style={{ width: '100%' }}>
        <div style={scoreTableStyles.container}>
            {children}
        </div>
    </Box>
}

const scoreTableStyles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: '.5fr 3fr 1fr',
        gap: '.5rem',
        width: '100%',
        alignItems: 'start',
        justifyItems: 'start',
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