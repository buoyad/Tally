import React from 'react'
import { Heading } from '@/app/ui/components'
import { redirectIfLoggedIn } from '@/app/lib/hooks'

export default async function Page() {
    await redirectIfLoggedIn()
    return <main>
        <Heading>Check your email</Heading>
        <p>Click the link sent to your email to finish signing in.</p>
    </main>
}
