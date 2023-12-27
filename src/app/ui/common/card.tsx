'use client'
import * as React from 'react'
import { styleSheet } from '../util'
import { TargetAndTransition, motion } from 'framer-motion'

const rotationRange = 4

type Props = {
    children: React.ReactNode
    style?: React.CSSProperties
}
export default function Card({ children, style }: Props) {
    const initRotate = Math.random() * rotationRange - (rotationRange / 2)
    const rotate = Math.random() * rotationRange - (rotationRange / 2)

    const [tAndT, setTAndT] = React.useState<TargetAndTransition>({
        filter: 'blur(0)', scale: 1, rotate,
        transition: { type: 'spring', bounce: 0, damping: 20, filter: { duration: .5 } }
    })

    const alignCard = () => setTAndT({
        filter: 'blur(0)', scale: 1, rotate: 0,
        transition: { type: 'tween', duration: .1, ease: 'easeIn' }
    })

    return <motion.div style={{ ...styles.container, ...style }}
        initial={{ scale: 1.02, filter: 'blur(2px)', rotate: initRotate }}
        whileInView={tAndT}
        viewport={{ once: true, amount: .25 }}
        onTap={alignCard}
        suppressHydrationWarning={true}
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