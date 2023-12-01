import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <p>Tally is a score keeper for the <a href="https://www.nytimes.com/crosswords/game/mini" target="_blank">New York Times Mini Crossword</a>.</p>
      <p><Link href="/login">Log in</Link> or <Link href="/tournaments">browse</Link> tournaments&apos; scores.</p>
    </main>
  )
}
