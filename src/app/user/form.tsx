'use client'
import * as React from 'react'
import { signOut } from 'next-auth/react'
import styles from '@/app/ui/form.module.css'
import { useFormStatus, useFormState } from 'react-dom'
import { changeUsername } from '../lib/actions'

export function LogoutButton() {
    const [pending, setPending] = React.useState(false)
    const handleClick = async () => {
        setPending(true)
        await signOut()
        setPending(false)
    }
    return <button className={styles.button} disabled={pending} onClick={handleClick}>{pending ? 'Logging out...' : 'Log out'}</button>
}

function ChangeUsernameSubmit() {
    const { pending } = useFormStatus()
    return <button className={styles.button} type="submit" disabled={pending}>{pending ? 'Changing...' : 'Change username'}</button>
}

export function ChangeUsernameForm({ id, username }: { id: number, username: string }) {
    const [state, formAction] = useFormState(changeUsername, { message: '' })
    return <form action={formAction}>
        <div className={styles.formSection}>
            <label htmlFor="username">Username</label>
            <input type="hidden" value={id} name="id" />
            <input className={styles.textInput} id="username" name="username" type="text" defaultValue={username} />
            <ChangeUsernameSubmit />
            {state?.message && <p className={styles.error}>{state.message}</p>}
        </div>
    </form>
}