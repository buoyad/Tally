import React from 'react'
import styles from './components.module.css'
import clsx from 'clsx'
import { Rubik, Rubik_Bubbles } from 'next/font/google'

const timeScoreFont = Rubik({ subsets: ['latin'], weight: '400' })
const timeScoreLargeFont = Rubik_Bubbles({ subsets: ['latin'], weight: '400' })

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
    const remainderStr = remainder === Math.floor(remainder) ? remainder.toString() : remainder.toFixed(1)
    return `${minutes}:${remainder < 10 ? '0' : ''}${remainderStr}`
}
export function TimeScore({ score, className, style, large }: { score: number, className?: string, style?: React.CSSProperties, large?: boolean }) {
    return <span className={clsx(styles.timeScore, timeScoreFont.className, className, { [styles.timeScoreLarge]: large, [timeScoreLargeFont.className]: large })} style={style}>{displaySeconds(score)}</span>
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
