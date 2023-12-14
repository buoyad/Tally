'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from '@/app/nav.module.css'
import { Roboto_Mono } from 'next/font/google'
import { clsx } from 'clsx'
import { UserInfo } from "./lib/types"
import { Icon } from "./ui/common"

const RoboMono = Roboto_Mono({ subsets: ['latin'] })

const CWTally = () => {
    const letters = ['T', 'A', 'L', 'L', 'Y', '🏁']
    return <>
        {letters.map((letter, idx) => <span className={clsx(RoboMono.className, styles.tallyletter)} key={idx}>{letter}</span>)}
    </>
}

export default function Nav({ userInfo }: { userInfo: UserInfo | null }) {
    const pathname = usePathname()
    return (
        <div className={styles.container}>
            <header className={styles.header}><Link href="/"><CWTally /></Link></header>
            {userInfo &&
                <Link href={`/${userInfo.name}`} className={clsx(RoboMono.className)}>
                    <span className={styles.iconContainer}>
                        <Icon name="user" width={24} height={24} strokeWidth={pathname.toLowerCase() === `/${userInfo.name.toLowerCase()}` ? 2.5 : 1.5} />
                    </span>
                </Link>
            }
            {!userInfo &&
                <Link href="/login" className={clsx(RoboMono.className)}>
                    <span className={styles.iconContainer}>
                        <Icon name="key" width={24} height={24} strokeWidth={pathname === '/login' ? 2.5 : 1.5} />
                    </span>
                </Link>}
        </div>
    )
}