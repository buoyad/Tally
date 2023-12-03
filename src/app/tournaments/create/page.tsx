import React from 'react'
import { Heading } from '@/app/ui/components'
import Form from './form'
import { getLoggedInUser } from '@/app/lib/hooks'

export default async function Create() {
    const { userInfo, session } = await getLoggedInUser(true)
    return <main>
        <Heading>Create a tournament</Heading>
        <Form />
    </main>
}