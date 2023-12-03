import React from 'react'
import styles from './components.module.css'
import clsx from 'clsx'

export function Heading({ children }: { children: React.ReactNode }) {
    return <h2 className={styles.heading}>{children}</h2>
}

export function Subheading({ children }: { children: React.ReactNode }) {
    return <h4 className={styles.subheading}>{children}</h4>
}

type GridBoxProps = {
    children: React.ReactNode,
    gap?: 'small' | 'medium' | 'large',
    style?: React.CSSProperties
}
export function GridBox({ children, gap = 'small', style }: GridBoxProps) {
    return <div className={clsx(styles.gridBox, styles[`gap-${gap}`])} style={style}>{children}</div>
}
