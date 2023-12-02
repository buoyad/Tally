import React from 'react'
import { Heading } from '@/app/ui/components'
import Form from './form'
import styles from '@/app/ui/form.module.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function Page() {
    const session = await getServerSession(authOptions)
    if (session?.user) {
        redirect('/user')
    }
    return <main>
        <Heading>Log in to Tally</Heading>
        <Form />
        <p className={styles.subtitle}>Tally will email you a link to create your account or login to your existing account.</p>
    </main>
}
