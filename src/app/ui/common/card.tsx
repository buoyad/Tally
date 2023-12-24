'use client'
import * as React from 'react'
import { styleSheet } from '../util'
import { motion } from 'framer-motion'

type Props = {
    children: React.ReactNode
    style?: React.CSSProperties
}
export default function Card({ children, style }: Props) {
    const rotate = Math.random() * 4 - 2
    return <motion.div style={{ ...styles.container, ...style }}
        initial={{ scale: .98, filter: 'blur(2px)' }}
        whileInView={{ filter: 'blur(0)', scale: 1, rotate }}
        transition={{ type: 'spring', bounce: 0, damping: 20, filter: { duration: .5 } }}
    >
        {children}
    </ motion.div>
}


const styles = styleSheet({
    container: {
        border: '1px solid var(--color-boxShadow)',
        boxShadow: '2px 2px var(--color-boxShadow)',
        padding: '24px',
        backgroundColor: 'var(--color-navBackground)'
    }
})