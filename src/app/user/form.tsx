'use client'
import * as React from 'react'
import { signOut } from 'next-auth/react'
import styles from '@/app/ui/form.module.css'
import { useFormState } from 'react-dom'
import { Button } from '@/app/ui/client-components'
import { changeUsername, removeInvite, acceptInvite, deleteScore } from '../lib/actions'
import { Box, TimeScore } from '../ui/components'
import { Score, UserInfo } from '../lib/types'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import { displayScoreDate } from '../lib/util'

dayjs.extend(isToday)

const messages: { [key: string]: string } = {
    score: 'Nice score! Check out how you stack up against your tournaments.',
}

export function Message({ userInfo }: { userInfo: UserInfo | null }) {
    const params = useSearchParams()
    const param = params.get('message')
    const inviteEmail = params.get('inviteEmail')

    let message = ''

    if (param) {
        message = messages[param]
    }

    if (inviteEmail) {
        if (inviteEmail === userInfo?.email) {
            message = 'Accept the invite below to join the tournament!'
        } else {
            message = `This invite isn't for you`
        }
    }

    if (!message) return null
    return <Box style={{ gridColumn: '1 / -1', justifySelf: 'start' }} className={styles.success}>
        <p>{message}</p>
    </Box>
}

export function LogoutButton() {
    const [pending, setPending] = React.useState(false)
    const handleClick = async () => {
        setPending(true)
        await signOut()
        setPending(false)
    }
    return <Button pending={pending} onClick={handleClick} label="Log out" pendingLabel="Logging out..." role="destroy" />
}

export function ChangeUsernameForm({ id, username }: { id: number, username: string }) {
    const [state, formAction] = useFormState(changeUsername, { message: '' })
    const [newUsername, setNewUsername] = React.useState(username)
    return <form action={formAction}>
        <Box>
            <label htmlFor="username"><strong>Username</strong></label>
            <input type="hidden" value={id} name="id" />
            <input className={styles.textInput} id="username" name="username" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            <Button typeSubmit={true} disabled={newUsername === username} label="Change username" pendingLabel="Changing..." />
            {state?.message && <p className={styles.error}>{state.message}</p>}
        </Box>
    </form>
}

export function InviteRow(props: { inviterName: string, tournamentName: string, id: number, userID: number }) {
    const { inviterName, tournamentName, id: inviteID, userID } = props

    return <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <span><strong>{inviterName}</strong> invited you to compete in <strong>{tournamentName}</strong>.<br />Do you want to compete? ⚔️</span>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: '12px', alignItems: 'center' }}>
            <AcceptInvite inviteID={inviteID} userID={userID} />
            <RejectInvite inviteID={inviteID} tournamentName={tournamentName} />
        </div>
    </div>
}

function AcceptInvite({ inviteID, userID }: { inviteID: number, userID: number }) {
    const [state, formAction] = useFormState(acceptInvite, { message: '' })
    return <form action={formAction}>
        <input type="hidden" name="inviteID" value={inviteID} />
        <input type="hidden" name="userID" value={userID} />
        <Button typeSubmit={true} label="Accept" pendingLabel="Accepting..." role="success" />
        {state?.message && <p className={styles.error}>{state.message}</p>}
    </form>
}

function RejectInvite({ inviteID, tournamentName }: { inviteID: number, tournamentName: string }) {
    const [state, formAction] = useFormState(removeInvite, { message: '' })
    return <form action={formAction}>
        <input type="hidden" name="inviteID" value={inviteID} />
        <input type="hidden" name="tournamentName" value={tournamentName} />
        <Button typeSubmit={true} label="Reject" pendingLabel="Rejecting..." role="destroy" />
        {state?.message && <p className={styles.error}>{state.message}</p>}
    </form>
}

export function ScoreTable({ scores, userID }: { scores: Score[], userID: number }) {
    return <div style={scoreTableStyles.container}>
        {scores.length === 0 &&
            <div style={scoreTableStyles.fullWidth}><p>None yet. <Link href="/score">Submit one now!</Link></p></div>}
        {scores.map((s, idx) =>
            <ScoreRow key={s.id} score={s} last={idx === scores.length - 1} />
        )}
    </div>
}

function ScoreRow({ score, last }: { score: Score, last: boolean }) {
    const { id, user_id, for_day, score: seconds } = score
    const [state, formAction] = useFormState(deleteScore, { message: '' })
    const deleteLabel = !!(state?.message) ? 'Error!' : 'Delete'
    return <>
        <p style={scoreTableStyles.justifySelfStart}>{displayScoreDate(for_day)}</p>
        <TimeScore score={seconds} />
        <form action={formAction}>
            <input type="hidden" name="scoreID" value={id} />
            <input type="hidden" name="userID" value={user_id} />
            <Button typeSubmit={true} label={deleteLabel} pendingLabel="Deleting..." role="destroy" />
        </form>
        {!last && <div style={scoreTableStyles.divider}></div>}
    </>

}

const scoreTableStyles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: '3fr .5fr 1fr',
        gap: '.5rem',
        width: '100%',
        alignItems: 'center',
        justifyItems: 'center',
    },
    justifySelfStart: { justifySelf: 'start' },
    fullWidth: {
        gridColumn: '1 / -1',
        justifySelf: 'start',
    },
    divider: {
        gridColumn: '1 / -1',
        backgroundColor: 'var(--color-text)',
        height: '1px',
        width: '50%',
    },
}