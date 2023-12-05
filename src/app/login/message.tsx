'use client'
import { useSearchParams } from "next/navigation"
import styles from '../ui/form.module.css'
import { Box } from "../ui/components"

export function Message() {
    const params = useSearchParams()
    const inviteEmail = params.get('inviteEmail')

    let message = ''

    if (inviteEmail) {
        message = 'Log in below to accept the invite'
    }

    if (!message) return null
    return <Box style={{ gridColumn: '1 / -1', justifySelf: 'start' }} className={styles.success}>
        <p>{message}</p>
    </Box>
}