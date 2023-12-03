import React from 'react'
import { GridBox, Heading } from '@/app/ui/components'
import Form from './form'
import { getLoggedInUser } from '@/app/lib/hooks'

export default async function Create() {
    const { userInfo, session } = await getLoggedInUser(true)
    return <main>
        <GridBox>
            <Heading>Create a tournament</Heading>
            <Form userID={userInfo!.id} />
        </GridBox>
    </main>
}