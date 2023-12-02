import React from 'react'
import { Heading } from '@/app/ui/components'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { LogoutButton } from './form'

export default async function Page() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect('/login')
    }
    const email = session.user!.email || ''
    return <main>
        <Heading>Logged in as {email}</Heading>
        <LogoutButton />
    </main>
}
