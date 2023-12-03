'use client'
import React from 'react'
import { createTournament } from '@/app/lib/actions'
import styles from "@/app/ui/form.module.css"
import { useFormState, useFormStatus } from 'react-dom'

const SubmitButton = () => {
    const { pending } = useFormStatus()
    return <button type="submit" className={styles.button} disabled={pending}>{pending ? 'Creating...' : 'Create'}</button>
}

export default function Form({ userID }: { userID: number }) {
    const [state, formAction] = useFormState(createTournament, { message: '' })
    return <form action={formAction}>
        <div className={styles.formSection}>
            <label htmlFor="tournamentName">Name the tournament</label>
            <input type="hidden" value={userID} name="userID" />
            <input id="tournamentName" name="tournamentName" type="text" placeholder="Tournament name" className={styles.textInput} />
            <SubmitButton />
            {state?.message && <p className={styles.error}>{state.message}</p>}
        </div>
    </form>
}