'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from '@/app/nav.module.css'
import { Roboto_Mono } from 'next/font/google'
import { clsx } from 'clsx'
import { UserInfo } from "./lib/types"
import { Dropdown } from "./ui/client-components"

const RoboMono = Roboto_Mono({ subsets: ['latin'] })

const CWTally = () => {
    const letters = ['T', 'A', 'L', 'L', 'Y', '🏁']
    return <>
        {letters.map((letter, idx) => <span className={clsx(RoboMono.className, styles.tallyletter)} key={idx}>{letter}</span>)}
    </>
}

export default function Nav({ userInfo }: { userInfo: UserInfo | null }) {
    const pathname = usePathname()
    const dropdownItems = [
        ...(userInfo ? [{ content: <Link href='/user'>Me</Link> }] : [{ content: <Link href='/login'>Log in</Link> }]),
    ]
    return (
        <div className={styles.container}>
            <header className={styles.header}><Link href="/"><CWTally /></Link></header>
            {/* <Dropdown items={dropdownItems} label={'|||'} /> */}
            {userInfo &&
                <Link href="/user" className={clsx({ [styles.active]: pathname === '/user' })}>Me</Link>
            }
            {!userInfo && <Link href="/login" className={clsx({ [styles.active]: pathname === '/login' })}>Log in</Link>}
        </div>
    )
}