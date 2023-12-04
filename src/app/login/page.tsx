import React from 'react'
import { Box, Heading } from '@/app/ui/components'
import Form from './form'
import styles from '@/app/ui/form.module.css'
import { Metadata } from 'next'
import { redirectIfLoggedIn } from '../lib/hooks'
import AuthError from './auth-error'

export default async function Page() {
    await redirectIfLoggedIn()
    return <main>
        <Box>
            <Heading>Log in to Tally</Heading>
            <AuthError />
            <Form />
            <p className={styles.subtitle}>Tally will email you a link to create your account or login to your existing account.</p>
        </Box>
    </main>
}

export const metadata: Metadata = {
    title: 'Log in',
    description: 'Log in to Tally'
}
