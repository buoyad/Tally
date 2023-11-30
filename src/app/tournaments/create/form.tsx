import React from 'react'
import { createTournament } from '@/app/lib/actions'
import styles from "@/app/ui/form.module.css"

export default function Form() {
    return <form action={createTournament}>
        <div className={styles.formSection}>
            <label htmlFor="tournamentName">Name the tournament</label>
            <input id="tournamentName" name="tournamentName" type="text" placeholder="Tournament name" className={styles.textInput} />
            <button type="submit" className={styles.button}>Create</button>
        </div>
    </form>
}