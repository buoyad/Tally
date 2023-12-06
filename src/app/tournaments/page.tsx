import Link from "next/link";
import * as db from "@/app/lib/db"
import { Box, Heading } from "../ui/components";

export default async function Page() {
    const tournaments = await db.getPopularTournaments()
    return <main style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <Heading>Popular tournaments</Heading>
        <Box style={styles.container}>
            {tournaments.flatMap(t => [
                <Link key={`link-${t.id}`} href={`/tournaments/${encodeURIComponent(t.name)}`}>{t.name}</Link>,
                <p key={`participants-${t.id}`}>{t.num_participants} {t.num_participants === '1' ? 'contestant' : 'contestants'}</p>,
            ])}
        </Box>
    </main>
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1rem',
    },
    fullWidth: {
        gridColumn: '1 / -1',
    },
    placeholder: {
        height: '100px',
        width: '100%',
        backgroundColor: 'lightgray',
    },
}