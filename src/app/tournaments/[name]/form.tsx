'use client'
import * as React from 'react'
import styles from '@/app/ui/form.module.css'
import * as validation from '@/app/lib/validation'
import { Button } from '@/app/ui/client-components'
import { useFormState } from 'react-dom'
import { inviteToTournament } from '@/app/lib/actions'

export function InviteToTournamentForm({ userID, tournamentID }: { userID: number, tournamentID: number }) {
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
        <div className={styles.formSection}>
            <label htmlFor="username">Invite someone to compete</label>
            <input type="hidden" value={userID} name="userID" />
            <input type="hidden" value={tournamentID} name="tournamentID" />
            <input className={styles.textInput} id="email" name="email" type="text" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button disabled={disabled} label="Invite user" pendingLabel="Inviting..." typeSubmit={true} role="success" />
            {state?.message && <p className={styles.error}>{state.message}</p>}
        </div>
    </form>
}

export function InviteRow({ invite }: { invite: { id: number, invitee_email: string } }) {
    return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', maxWidth: '300px' }}>
        <span >{invite.invitee_email}</span>
        <Button label="Revoke" pendingLabel="Revoking..." role="destroy" />
    </div>
}
