'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from '@/app/nav.module.css'
import { Roboto_Mono } from 'next/font/google'
import { clsx } from 'clsx'

const RoboMono = Roboto_Mono({ subsets: ['latin'] })

const links = [
    { href: "/tournaments", title: "Tournaments" }
]

const CWTally = () => {
    const letters = ['T', 'A', 'L', 'L', 'Y', '🏁']
    return <>
        {letters.map((letter, idx) => <span className={clsx(RoboMono.className, styles.tallyletter)} key={idx}>{letter}</span>)}
    </>
}

export default function Nav() {
    const pathname = usePathname()
    return (
        <div className={styles.container}>
            <header className={styles.header}><Link href="/"><CWTally /></Link></header>
            {/* {links.map(link => (
                <Link key={link.href} href={link.href} className={clsx({
                    [styles.active]: link.href === pathname
                })}>{link.title}</Link>
            ))} */}
        </div>
    )
}