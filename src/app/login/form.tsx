'use client'
import React, { MouseEventHandler } from 'react'
import styles from "@/app/ui/form.module.css"
import * as validation from '@/app/lib/validation'
import { Button } from '@/app/ui/client-components'
import { signIn, SignInOptions } from 'next-auth/react'
import { Subtitle } from '../ui/components'
import { useRouter } from 'next/navigation'

const EnterEmail = ({ initialEmail, onSuccess }: { initialEmail: string | null, onSuccess: (email: string) => void }) => {
    const [email, setEmail] = React.useState(initialEmail || '')
    const [disabled, setDisabled] = React.useState(true)
    const router = useRouter()

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
        const res = await signIn('email', { email, redirect: false })
        setPending(false)
        if (res?.error) {
            if (res?.url) {
                router.replace(res.url);
            } else {
                router.replace(`/login?error=${encodeURIComponent(res.error)}`)
            }
        } else {
            router.replace('/login')
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
    const router = useRouter()

    React.useEffect(() => {
        setDisabled(!code)
    }, [code])

    const handleSubmit = async () => {
        const res = await fetch(`/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(code)}&callbackUrl=${encodeURIComponent('/login-success')}`)
        const redirectUrl = res.url
        // this is hacky, but the alternative leads to a terrible UX of multiple reloads before we land on the user page
        if (redirectUrl.includes('/login-success')) {
            router.refresh() // this will redirect to the user page
        } else {
            router.replace('/login?error=Verification')
        }
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