import React from 'react'
import { loginUser } from '@/app/lib/actions'
import styles from "@/app/ui/form.module.css"

export default function Form() {
    return <form action={loginUser}>
        <div className={styles.formSection}>
            <input id="email" name="email" type="email" placeholder="Email" className={styles.textInput} required={true} />
            <button type="submit" className={styles.button}>Send me a link</button>
        </div>
    </form>
}