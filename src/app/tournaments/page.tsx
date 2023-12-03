import Link from "next/link";

export default function Page() {
    return <main>
        <p>Tournament page</p>
        <Link href="/tournaments/create">Create a tournament</Link>
    </main>
}