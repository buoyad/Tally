'use client'
import * as React from 'react'
import styles from '@/app/ui/form.module.css'
import * as validation from '@/app/lib/validation'
import { Button } from '@/app/ui/client-components'
import { useFormState } from 'react-dom'
import { inviteToTournament, removeInvite, leaveTournament } from '@/app/lib/actions'
import { GridBox } from '@/app/ui/components'

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
        <GridBox style={{ placeContent: 'start' }}>
            <label htmlFor="username">Invite someone to compete</label>
            <input type="hidden" value={userID} name="userID" />
            <input type="hidden" value={tournamentID} name="tournamentID" />
            <input type="hidden" value={tournamentName} name="tournamentName" />
            <input className={styles.textInput} id="email" name="email" type="text" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button disabled={disabled} label="Invite user" pendingLabel="Inviting..." typeSubmit={true} role="success" />
            {state?.message && <p className={styles.error}>{state.message}</p>}
        </GridBox>
    </form>
}

export function InviteRow({ invite, tournamentName }: { invite: { id: number, invitee_email: string }, tournamentName: string }) {
    const [state, formAction] = useFormState(removeInvite, { message: '' })
    return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-block', textOverflow: 'ellipsis', overflow: 'hidden' }}>{invite.invitee_email}</span>
        <form action={formAction}>
            <input type="hidden" name="tournamentName" value={tournamentName} />
            <input type="hidden" name="inviteID" value={invite.id} />
            <Button label="Cancel" pendingLabel="Canceling..." role="destroy" typeSubmit={true} />
        </form>
    </div>
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
