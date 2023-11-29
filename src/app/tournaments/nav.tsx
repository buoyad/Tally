'use client'
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function Nav() {
    const searchParams = useSearchParams()
    const tournamentID = searchParams.get("id")

    if (tournamentID) {
        return (
            <>
                <Link href={`/tournaments/score?${searchParams.toString()}`}>Score</Link>
                <Link href={`/tournaments/stats?${searchParams.toString()}`}>Stats</Link>
                <Link href="/tournaments">Back to tournaments</Link>
            </>
        )
    }
    return null
}