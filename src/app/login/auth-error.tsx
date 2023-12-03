'use client'

import { useSearchParams } from "next/navigation"
import styles from '@/app/ui/form.module.css'

export default function AuthError() {
    const params = useSearchParams()
    const error = params.get('error')
    if (!error) return null
    return <div className={styles.error}>
        <p>{errorMessages[error] || errorMessages.Default}</p>
    </div>
}

const errorMessages: { [key: string]: string } = {
    'Configuration': 'Danny messed up configurating the authentication system. Please let me know about this.',
    'Verification': 'This verification token has expired.',
    'EmailCreateAccount': 'There was a problem creating your account. Please try again.',
    'EmailSignin': 'There was a problem sending the verification email. If the problem persists, please contact Danny.',
    'Default': 'There was an unknown error, please try again.',
}