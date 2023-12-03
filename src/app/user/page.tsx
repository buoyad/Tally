import React from 'react'
import { Heading } from '@/app/ui/components'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/auth'
import { redirect } from 'next/navigation'
import { ChangeUsernameForm, LogoutButton } from './form'
import { getUser } from '../lib/db'

export default async function Page() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect('/login')
    }
    const email = session.user!.email || ''
    const userInfo = await getUser(email)
    return <main>
        <Heading>Logged in as {userInfo.name}</Heading>
        <ChangeUsernameForm id={userInfo.id} username={userInfo.name} />
        <br /><br />
        <LogoutButton />
    </main>
}
