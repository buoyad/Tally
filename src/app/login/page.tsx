import React from 'react'
import { Box, Heading } from '@/app/ui/components'
import Form from './form'
import { Metadata } from 'next'
import { redirectIfLoggedIn } from '../lib/hooks'
import AuthError from './auth-error'
import { Message } from './message'

export default async function Page({ searchParams }: { searchParams?: any }) {
    const email = searchParams?.inviteEmail || null
    const redirectParams = email ? `?inviteEmail=${email}` : ``
    await redirectIfLoggedIn(undefined, redirectParams)
    return <main>
        <Box>
            <Message />
            <Heading>Log in to Tally</Heading>
            <AuthError />
            <Form initialEmail={email} />
        </Box>
    </main>
}

export const metadata: Metadata = {
    title: 'Log in',
    description: 'Log in to Tally'
}
