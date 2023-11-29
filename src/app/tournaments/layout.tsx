'use client'
import { useSearchParams } from "next/navigation";
import Nav from "./nav";

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    return <>
        <header>Tournament{id ? ` ${id}` : ''}</header>
        <Nav />
        {children}
    </>
}