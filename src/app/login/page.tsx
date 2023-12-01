'use client'
import React from 'react'
import { Heading } from '@/app/ui/components'
import Form from './form'
import styles from '@/app/ui/form.module.css'
import { useFormStatus } from 'react-dom'

export default function Page() {
    return <main>
        <Heading>Log in to Tally</Heading>
        <Form />
        <p className={styles.subtitle}>Tally will email you a link to create your account or login to your existing account.</p>
    </main>
}
