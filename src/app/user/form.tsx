'use client'
import * as React from 'react'
import { signOut } from 'next-auth/react'
import styles from '@/app/ui/form.module.css'

export function LogoutButton() {
    const [pending, setPending] = React.useState(false)
    const handleClick = async () => {
        setPending(true)
        await signOut()
        setPending(false)
    }
    return <button className={styles.button} disabled={pending} onClick={handleClick}>{pending ? 'Logging out...' : 'Log out'}</button>
}