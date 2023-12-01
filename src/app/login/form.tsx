'use client'
import React from 'react'
import { loginUser } from '@/app/lib/actions'
import styles from "@/app/ui/form.module.css"
import * as validation from '@/app/lib/validation'
import { useFormStatus } from 'react-dom'

const SubmitButton = ({ disabled }: { disabled: boolean }) => {
    const { pending } = useFormStatus()
    const buttonDisabled = disabled || pending
    return <button className={styles.button} disabled={buttonDisabled} aria-disabled={buttonDisabled}>{pending ? 'Sending...' : 'Send me a link'}</button>
}

export default function Form() {
    const [email, setEmail] = React.useState('')
    const [disabled, setDisabled] = React.useState(true)

    React.useEffect(() => {
        if (validation.email(email)) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [email])
    return <form action={loginUser}>
        <div className={styles.formSection}>
            <input id="email" name="email" type="email" placeholder="Email" className={styles.textInput} required={true} value={email} onChange={e => setEmail(e.target.value)} />
            <SubmitButton disabled={disabled} />
        </div>
    </form>
}