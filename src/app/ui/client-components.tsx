'use client'
import React from 'react'
import styles from './components.module.css'
import formStyles from './form.module.css'
import { useFormStatus } from 'react-dom'
import { displaySeconds } from '@/app/lib/util'
import { Tilt_Warp } from 'next/font/google'
import { useTransition, animated } from '@react-spring/web'
import clsx from 'clsx'

const timeScoreLargeFont = Tilt_Warp({ subsets: ['latin'], weight: '400' })

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

export function TimeScoreLarge({ score, className, style }: { score: number, className?: string, style?: React.CSSProperties }) {
    return <span className={clsx(styles.timeScore, styles.timeScoreLarge, timeScoreLargeFont.className, className)} style={style}>
        <AnimatedText>{displaySeconds(score)}</AnimatedText>
    </span>
}

function AnimatedText({ children }: { children: string }) {
    let chars = children.split('')
    const transitions = useTransition(
        chars,
        {
            from: { y: `-1em` },
            enter: { y: '0' },
            leave: { y: '0' },
            trail: 75,
            config: {
                mass: 1,
                tension: 1000,
                friction: 30,
            },
        }
    )

    return transitions((style, item) => <animated.span style={{ display: 'inline-block', ...style }}>{item}</animated.span>)
}
