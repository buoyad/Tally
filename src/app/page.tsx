import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <p>Welcome to Tally.</p>
      <p>Tally is a score keeper for the <a href="https://www.nytimes.com/crosswords/game/mini">New York Times Mini Crossword.</a></p>
    </main>
  )
}
