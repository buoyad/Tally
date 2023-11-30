import React from 'react'
import styles from './components.module.css'

export function Heading({ children }: { children: React.ReactNode }) {
    return <h2 className={styles.heading}>{children}</h2>
}
