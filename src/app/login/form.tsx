'use client'
import React, { MouseEventHandler } from 'react'
import styles from "@/app/ui/form.module.css"
import * as validation from '@/app/lib/validation'
import { Button } from '@/app/ui/client-components'
import { signIn } from 'next-auth/react'

export default function Form({ initialEmail }: { initialEmail: string | null }) {
    const [email, setEmail] = React.useState(initialEmail || '')
    const [disabled, setDisabled] = React.useState(true)

    React.useEffect(() => {
        if (validation.email(email)) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [email])

    const [pending, setPending] = React.useState(false)
    const buttonDisabled = disabled || pending
    const handleSubmit: MouseEventHandler = async (e) => {
        setPending(true)
        await signIn('email', { email })
        setPending(false)
    }
    return <form>
        <div className={styles.formSection}>
            <input id="email" name="email" type="email" placeholder="Email" className={styles.textInput} required={true} value={email} onChange={e => setEmail(e.target.value)} />
            <Button disabled={buttonDisabled} pending={pending} label="Send me a link" pendingLabel="Sending..." role="success" onClick={handleSubmit} />
        </div>
    </form>
}