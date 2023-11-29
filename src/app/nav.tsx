'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from './nav.module.css'

const links = [
    { href: "/tournaments", title: "Tournaments" }
]

export default function Nav() {
    const pathname = usePathname()
    return (
        <div className={styles.container}>
            <header><Link href="/">Tally 🏁</Link></header>
            {links.map(link => (
                <Link key={link.href} href={link.href} className={pathname === link.href ? styles.active : ""}>{link.title}</Link>
            ))}
        </div>
    )
}