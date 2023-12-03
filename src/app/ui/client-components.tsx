'use client'
import React from 'react'
import styles from './components.module.css'
import formStyles from './form.module.css'
import { useFormStatus } from 'react-dom'
import clsx from 'clsx'

type ButtonProps = {
    disabled?: boolean
    label: string
    pending?: boolean
    pendingLabel?: string
    typeSubmit?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    role?: 'success' | 'destroy'
}
export function Button(props: ButtonProps) {
    const { disabled, label, pendingLabel, typeSubmit, role = 'success', pending: pPending, onClick } = props
    const { pending: fsPending } = useFormStatus()
    const pending = pPending || fsPending
    const buttonDisabled = disabled || pending
    return <button
        className={clsx(formStyles.button, { [formStyles.buttonSuccess]: role === 'success', [formStyles.buttonDestroy]: role === 'destroy' })}
        type={typeSubmit ? 'submit' : undefined}
        disabled={buttonDisabled} aria-disabled={buttonDisabled}
        onClick={onClick}>
        {pending ? (pendingLabel || label) : label}
    </button>
}
