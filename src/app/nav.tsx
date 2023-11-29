'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from './nav.module.css'

const links = [
    { href: "/", title: "Home" },
    { href: "/tournaments", title: "Tournaments" }
]

export default () => {
    const pathname = usePathname()
    return (
        <div className={styles.container}>
            {links.map(link => (
                <Link key={link.href} href={link.href} className={pathname === link.href ? styles.active : ""}>{link.title}</Link>
            ))}
        </div>
    )
}