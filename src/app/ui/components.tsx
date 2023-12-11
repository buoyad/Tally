import React from 'react'
import styles from './components.module.css'
import formStyles from './form.module.css'
import loadingStyles from './loading.module.css'
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

export function Subtitle({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
    return <p className={formStyles.subtitle} style={style}>{children}</p>
}

export function TimeScore({ score, className, style, large }: { score: number, className?: string, style?: React.CSSProperties, large?: boolean }) {
    if (large) return <TimeScoreLarge score={score} className={className} style={style} />
    return <span className={clsx(styles.timeScore, timeScoreFont.className, className)} style={style}>{displaySeconds(score)}</span>
}

export function LoadingIndicator({ size = 'small' }: { size?: 'small' | 'large' }) {
    return <div className={clsx(loadingStyles.loading_container, loadingStyles[`loading_container_${size}`])}>
        <div className={loadingStyles.loading_box}>
            <div></div><div></div><div></div><div></div>
        </div>
    </div>
}

type BoxProps = {
    children?: React.ReactNode,
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

export const Ordinal = ({ position, style }: { position: number, style?: React.CSSProperties }) => {
    let suffix: string
    switch (position) {
        case 1:
            suffix = 'st'
            break
        case 2:
            suffix = 'nd'
            break
        case 3:
            suffix = 'rd'
            break
        default:
            suffix = 'th'
    }
    return <p style={style}>{position}<sup>{suffix}</sup></p>
}
