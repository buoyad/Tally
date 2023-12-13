'use client'
import React from 'react'
import styles from './components.module.css'
import formStyles from './form.module.css'
import { useFormStatus } from 'react-dom'
import { displaySeconds } from '@/app/lib/util'
import { Tilt_Warp } from 'next/font/google'
import { useTransition, animated, UseTransitionProps } from '@react-spring/web'
import clsx from 'clsx'
import { Box } from './components'

export const timeScoreLargeFont = Tilt_Warp({ subsets: ['latin'], weight: '400' })

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

export function TimeScoreLarge({ score, className, style, placeholder }: { score: number, className?: string, style?: React.CSSProperties, placeholder?: string[] }) {
    return <div className={clsx(styles.timeScore, styles.timeScoreLarge, timeScoreLargeFont.className, className)} style={style}>
        <AnimatedText placeholder={placeholder}>{displaySeconds(score)}</AnimatedText>
    </div>
}

export function AnimatedText({ children, placeholder = ['0', ':', '0', '0', '.', '0'], className, style }: { children: string, placeholder?: string[], className?: string, style?: React.CSSProperties }) {
    let chars = children.split('')
    const commonConfig: UseTransitionProps = {
        trail: 75,
        config: {
            mass: 1,
            tension: 700,
            friction: 30,
        },
    }
    const transitions = useTransition(
        chars,
        {
            from: { y: `-1.2em` },
            enter: { y: '0' },
            leave: { y: '0' },
            keys: chars.map((_, idx) => `${idx}-char`),
            ...commonConfig,
        }
    )

    const placeholderTransitions = useTransition(
        placeholder,
        {
            from: { y: '0' },
            enter: { y: '1.2em' },
            leave: { y: '1.2em' },
            keys: placeholder.map((_, idx) => `${idx}-placeholder`),
            ...commonConfig,
        }
    )

    // placeholder chars set the height of the top level Box, then the children are absolutely positioned to occupy the same space.
    return <Box row={true} gap="none" style={{ overflow: 'hidden', position: 'relative', width: '100%', ...style }} className={className}>
        <Box row={true} gap="none" style={{ position: 'absolute' }}>
            {transitions((style, item, _, idx) => <animated.span style={{ display: 'inline-block', ...style }}>{item}</animated.span>)}
        </Box>
        {placeholderTransitions((style, item, _, idx) => <animated.span style={{ display: 'inline-block', opacity: 0.5, ...style }}>{item}</animated.span>)}
    </Box>
}
