import React from 'react'
import styles from './components.module.css'

export function Heading({ children }: { children: React.ReactNode }) {
    return <h2 className={styles.heading}>{children}</h2>
}

export function Subheading({ children }: { children: React.ReactNode }) {
    return <h4 className={styles.subheading}>{children}</h4>
}
