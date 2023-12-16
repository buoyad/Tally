'use client'
import React, { MouseEventHandler } from 'react'
import styles from "@/app/ui/form.module.css"
import * as validation from '@/app/lib/validation'
import { Button } from '@/app/ui/client-components'
import { signIn } from 'next-auth/react'
import { Subtitle } from '../ui/components'

const EnterEmail = ({ initialEmail, onSuccess }: { initialEmail: string | null, onSuccess: (email: string) => void }) => {
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
        console.log(email)
        setPending(true)
        const res = await signIn('email', { email, redirect: false })
        setPending(false)
        if (res?.error) {
            if (res?.url) {
                window.location.replace(res.url);
            }
        } else {
            onSuccess(email);
        }
    }
    return <form onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formSection}>
            <input id="email" name="email" type="email" placeholder="Email" className={styles.textInput} required={true} value={email} onChange={e => setEmail(e.target.value)} />
            <Button disabled={buttonDisabled} pending={pending} label="Send me a code" pendingLabel="Sending..." role="success" onClick={handleSubmit} />
        </div>
        <Subtitle>Tally will email you a code to create your account or login to your existing account.</Subtitle>
    </form>
}

const VerifyCode = ({ email }: { email: string }) => {
    const [code, setCode] = React.useState('')
    const [disabled, setDisabled] = React.useState(true)

    React.useEffect(() => {
        setDisabled(!code)
    }, [code])

    const handleSubmit = () => {
        window.location.href =
            `/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(code)}&callbackUrl=${encodeURIComponent('/?message=loginSuccess')}`
    }

    return <form onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formSection}>
            <input
                id="code"
                name="code"
                type="text"
                placeholder="Verification code"
                autoComplete='one-time-code'
                className={styles.textInput}
                required={true}
                value={code} onChange={e => setCode(e.target.value)} />
            <Button disabled={disabled} label="Verify" role="success" onClick={handleSubmit} />
        </div>
        <Subtitle>Enter the code you received in your email.</Subtitle>
    </form>
}

export default function Form({ initialEmail }: { initialEmail: string | null }) {
    const [verifyingEmail, setVerifyingEmail] = React.useState('')

    if (!!verifyingEmail) {
        return <VerifyCode email={verifyingEmail} />
    }

    return <EnterEmail initialEmail={initialEmail} onSuccess={(email) => setVerifyingEmail(email)} />
}