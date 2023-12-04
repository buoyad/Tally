'use client'
import * as React from 'react'
import { signOut } from 'next-auth/react'
import styles from '@/app/ui/form.module.css'
import { useFormState } from 'react-dom'
import { Button } from '@/app/ui/client-components'
import { changeUsername, removeInvite, acceptInvite } from '../lib/actions'
import { Box } from '../ui/components'

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
        <span>Someone named &apos;{inviterName}&apos; invited you to compete in <strong>{tournamentName}</strong>. Do you know them? Do you trust them?</span>
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