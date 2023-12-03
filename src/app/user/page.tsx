import React from 'react'
import { Heading } from '@/app/ui/components'
import { ChangeUsernameForm, LogoutButton } from './form'
import { getLoggedInUser } from '../lib/hooks'

export default async function Page() {
    const { session, userInfo } = await getLoggedInUser(true)
    if (!session) return null
    return <main>
        <Heading>Logged in as {userInfo.name}</Heading>
        <ChangeUsernameForm id={userInfo.id} username={userInfo.name} />
        <br /><br />
        <LogoutButton />
    </main>
}
