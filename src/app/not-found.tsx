import Link from "next/link";
import { Box, Heading } from "./ui/components";

const clues = [
    { clue: 'Unsuccessful URL attempt (10)', answer: 'BROKEN LINK' },
    { clue: 'Cyberspace disappointment (11)', answer: 'MISSING PAGE' },
    { clue: 'Elusive webpage result (8)', answer: 'NOT FOUND' },
    { clue: `Browser's dissapointing message (12)`, answer: 'PAGE NOT FOUND' },
]

export default function NotFound() {
    const clue = clues[Math.floor(Math.random() * clues.length)]
    return <main>
        <Box>
            <Heading>{clue.clue}</Heading>
            <p>Answer: <strong>{clue.answer}</strong></p>
            <p>The page you&apos;re looking for doesn&apos;t exist.</p>
            <p>Go back <Link href="/">home</Link>.</p>
        </Box>
    </main>
}