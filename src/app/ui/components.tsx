import React from 'react'
import styles from './components.module.css'
import clsx from 'clsx'
import { Baloo_2 } from 'next/font/google'
import { TimeScoreLarge } from './client-components'
import { displaySeconds } from '@/app/lib/util'

const timeScoreFont = Baloo_2({ subsets: ['latin'], weight: '500' })

export function Heading({ children }: { children: React.ReactNode }) {
    return <h2 className={styles.heading}>{children}</h2>
}

export function Subheading({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
    return <h4 className={styles.subheading} style={style}>{children}</h4>
}

export function TimeScore({ score, className, style, large }: { score: number, className?: string, style?: React.CSSProperties, large?: boolean }) {
    if (large) return <TimeScoreLarge score={score} className={className} style={style} />
    return <span className={clsx(styles.timeScore, timeScoreFont.className, className)} style={style}>{displaySeconds(score)}</span>
}

type BoxProps = {
    children: React.ReactNode,
    gap?: 'small' | 'medium' | 'large' | 'none',
    style?: React.CSSProperties,
    row?: boolean,
    className?: string,
}
export function Box({ children, gap = 'small', style, row = false, className }: BoxProps) {
    return <div
        className={clsx(styles.gridBox, styles[`gap-${gap}`], { [styles.gridBoxRow]: row }, className)}
        style={style}>
        {children}
    </div>
}
