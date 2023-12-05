import React from 'react'
import styles from './components.module.css'
import clsx from 'clsx'

export function Heading({ children }: { children: React.ReactNode }) {
    return <h2 className={styles.heading}>{children}</h2>
}

export function Subheading({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
    return <h4 className={styles.subheading} style={style}>{children}</h4>
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
