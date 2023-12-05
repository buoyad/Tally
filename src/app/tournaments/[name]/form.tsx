'use client'
import * as React from 'react'
import styles from '@/app/ui/form.module.css'
import * as validation from '@/app/lib/validation'
import { Button } from '@/app/ui/client-components'
import { useFormState } from 'react-dom'
import { inviteToTournament, removeInvite, leaveTournament } from '@/app/lib/actions'
import { Box, Subheading } from '@/app/ui/components'
import { Score, UserInfo } from '@/app/lib/types'
import Link from 'next/link'

export function InviteToTournamentForm({ userID, tournamentID, tournamentName }: { userID: number, tournamentID: number, tournamentName: string }) {
    const [state, formAction] = useFormState(inviteToTournament, { message: '' })
    const [email, setEmail] = React.useState('')
    const [disabled, setDisabled] = React.useState(true)

    React.useEffect(() => {
        if (validation.email(email)) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [email])

    return <form action={formAction}>
        <Box>
            <label htmlFor="username">Invite someone to compete</label>
            <input type="hidden" value={userID} name="userID" />
            <input type="hidden" value={tournamentID} name="tournamentID" />
            <input type="hidden" value={tournamentName} name="tournamentName" />
            <input className={styles.textInput} id="email" name="email" type="text" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button disabled={disabled} label="Invite user" pendingLabel="Inviting..." typeSubmit={true} role="success" />
            {state?.message && <p className={styles.error}>{state.message}</p>}
        </Box>
    </form>
}

export function InviteRow({ invite, tournamentName }: { invite: { id: number, invitee_email: string }, tournamentName: string }) {
    const [state, formAction] = useFormState(removeInvite, { message: '' })
    return <Box row={true} style={{ justifyContent: 'space-between', width: '100%', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-block', textOverflow: 'ellipsis', overflow: 'hidden', flexBasis: 0, flexGrow: 1 }}>{invite.invitee_email}</span>
        <form action={formAction}>
            <input type="hidden" name="tournamentName" value={tournamentName} />
            <input type="hidden" name="inviteID" value={invite.id} />
            <Button label="Cancel" pendingLabel="Canceling..." role="destroy" typeSubmit={true} />
        </form>
    </Box>
}

export function LeaveTournamentForm({ tournamentID, tournamentName, userID, isLastUser }: { tournamentID: number, tournamentName: string, userID: number, isLastUser: boolean }) {
    const [state, formAction] = useFormState(leaveTournament, { message: '' })
    return <form action={formAction}>
        <input type="hidden" name="tournamentID" value={tournamentID} />
        <input type="hidden" name="tournamentName" value={tournamentName} />
        <input type="hidden" name="userID" value={userID} />
        <Button label="Leave tournament" pendingLabel="Leaving..." role="destroy" typeSubmit={true} disabled={isLastUser} />
        {isLastUser && <p className={styles.subtitle}>The last participant cannot leave a tournament</p>}
        {state?.message && <p className={styles.error}>{state.message}</p>}
    </form>
}

const displaySeconds = (seconds: number) => {
    // convert seconds to '00:00' format
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`
}

type LeaderboardTodayProps = {
    scores: Score[],
    usersByID: { [key: number]: { id: number, name: string } },
    loggedInUser: UserInfo | null,
    currentUserIsParticipant: boolean,
}

export function LeaderboardToday({ scores, usersByID, loggedInUser, currentUserIsParticipant }: LeaderboardTodayProps) {
    const today = new Date().toISOString().split('T')[0]
    // console.log(today)
    const todayScores = scores.filter(s => s.for_day.toISOString().split('T')[0] === today).sort((a, b) => a.score - b.score)
    // console.log(todayScores)

    const children = []

    if (todayScores.length === 0) {
        children.push(<p key="no-scores" style={scoreTableStyles.fullWidth}>No scores yet today</p>)
    }

    const currentUserHasSubmittedScore = todayScores.some(s => s.user_id === loggedInUser?.id)
    if (todayScores.length > 0) {
        children.push(
            <Subheading key="name-heading">Name</Subheading>,
            <Subheading key="score-heading">Score</Subheading>,
            todayScores.flatMap(s => [
                <p key={`name-${s.id}`} style={s.user_id === loggedInUser?.id ? scoreTableStyles.fontWeightBold : {}}>{usersByID[s.user_id].name}</p>,
                <p key={`score-${s.id}`}>{displaySeconds(s.score)}</p>,
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
        gridTemplateColumns: '3fr 1fr',
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
