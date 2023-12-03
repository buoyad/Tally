import React from 'react'
import { GridBox, Heading, Subheading } from '@/app/ui/components'
import { ChangeUsernameForm, LogoutButton, InviteRow } from './form'
import { getLoggedInUser } from '../lib/hooks'
import { getUserTournaments, getUserInvites } from '../lib/db'
import Link from 'next/link'

export default async function Page() {
    const { session, userInfo } = await getLoggedInUser(true)
    if (!session) return null
    const tournaments = await getUserTournaments(userInfo.id)
    const invites = await getUserInvites(userInfo.email)

    return <main style={styles.container}>
        <GridBox style={styles.fullWidth}>
            <Heading>Logged in as {userInfo.name}</Heading>
        </GridBox>
        <GridBox>
            <Subheading>Your tournaments</Subheading>
            {tournaments.length === 0 && <p>None yet. <Link href="/tournaments/create">Make one now!</Link></p>}
            {tournaments.map(t => <p key={t.id}><Link href={`/tournaments/${t.name}`}>{t.name}</Link></p>)}
        </GridBox>
        <GridBox>
            <Subheading>Your invites</Subheading>
            {invites.length === 0 && <p>None yet.</p>}
            {invites.map(i => <InviteRow key={i.id} inviterName={i.inviter_name} tournamentName={i.tournament_name} id={i.id} userID={userInfo.id} />)}
        </GridBox>
        <GridBox style={styles.placeContentStart}>
            <ChangeUsernameForm id={userInfo.id} username={userInfo.name} />
        </GridBox>
        <GridBox style={styles.logout}>
            <LogoutButton />
        </GridBox>
    </main>
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
    },
    fullWidth: {
        gridColumn: '1 / -1'
    },
    logout: {
        placeSelf: 'end stretch',
    },
    placeContentStart: {
        placeContent: 'start'
    }
}
