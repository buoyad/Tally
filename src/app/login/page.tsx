import React from 'react'
import { Box, Heading } from '@/app/ui/components'
import Form from './form'
import styles from '@/app/ui/form.module.css'
import { Metadata } from 'next'
import { redirectIfLoggedIn } from '../lib/hooks'
import AuthError from './auth-error'
import { Message } from './message'

export default async function Page({ searchParams }: { searchParams?: any }) {
    const email = searchParams?.inviteEmail || null
    const redirectPath = email ? `/user?inviteEmail=${email}` : `/user`
    await redirectIfLoggedIn(redirectPath)
    return <main>
        <Box>
            <Message />
            <Heading>Log in to Tally</Heading>
            <AuthError />
            <Form initialEmail={email} />
            <p className={styles.subtitle}>Tally will email you a link to create your account or login to your existing account.</p>
        </Box>
    </main>
}

export const metadata: Metadata = {
    title: 'Log in',
    description: 'Log in to Tally'
}
