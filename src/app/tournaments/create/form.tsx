'use client'
import React from 'react'
import { createTournament } from '@/app/lib/actions'
import styles from "@/app/ui/form.module.css"
import { Button } from '@/app/ui/client-components'
import { useFormState, useFormStatus } from 'react-dom'

export default function Form({ userID }: { userID: number }) {
    const [state, formAction] = useFormState(createTournament, { message: '' })
    return <form action={formAction}>
        <div className={styles.formSection}>
            <label htmlFor="tournamentName">Name the tournament</label>
            <input type="hidden" value={userID} name="userID" />
            <input id="tournamentName" name="tournamentName" type="text" placeholder="Tournament name" className={styles.textInput} />
            <Button typeSubmit={true} label="Create" pendingLabel="Creating..." />
            {state?.message && <p className={styles.error}>{state.message}</p>}
        </div>
    </form>
}