import React from 'react'
import styles from './components.module.css'
import clsx from 'clsx'
import { Rubik } from 'next/font/google'

const timeScoreFont = Rubik({ subsets: ['latin'], weight: '400' })

export function Heading({ children }: { children: React.ReactNode }) {
    return <h2 className={styles.heading}>{children}</h2>
}

export function Subheading({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
    return <h4 className={styles.subheading} style={style}>{children}</h4>
}

const displaySeconds = (seconds: number) => {
    // convert seconds to '00:00' format
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`
}
export function TimeScore({ score, className, style }: { score: number, className?: string, style?: React.CSSProperties }) {
    return <span className={clsx(styles.timeScore, timeScoreFont.className, className)} style={style}>{displaySeconds(score)}</span>
}

type BoxProps = {
    children: React.ReactNode,
    gap?: 'small' | 'medium' | 'large',
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
