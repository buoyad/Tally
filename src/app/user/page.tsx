import React from 'react'
import { Heading, Subheading } from '@/app/ui/components'
import { ChangeUsernameForm, LogoutButton } from './form'
import { getLoggedInUser } from '../lib/hooks'
import { getUserTournaments } from '../lib/db'
import Link from 'next/link'

export default async function Page() {
    const { session, userInfo } = await getLoggedInUser(true)
    if (!session) return null
    const tournaments = await getUserTournaments(userInfo.id)
    return <main>
        <Heading>Logged in as {userInfo.name}</Heading>
        <ChangeUsernameForm id={userInfo.id} username={userInfo.name} />
        <Subheading>Your tournaments</Subheading>
        {tournaments.length === 0 && <p>None yet. <Link href="/tournaments/create">Make one now!</Link></p>}
        {tournaments.map(t => <p key={t.id}><Link href={`/tournaments/${t.name}`}>{t.name}</Link></p>)}
        <br /><br />
        <LogoutButton />
    </main>
}
