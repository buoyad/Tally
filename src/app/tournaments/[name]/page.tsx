import { getTournamentInfo, getTournamentInvites } from "@/app/lib/db"
import { Box, Heading, Subheading } from "@/app/ui/components"
import { redirect } from "next/navigation"
import { InviteToTournamentForm, InviteRow, LeaveTournamentForm } from "./form"
import { getLoggedInUser } from "@/app/lib/hooks"

export default async function Page({ params }: { params: { name: string } }) {
    const session = await getLoggedInUser()
    const tournamentName = decodeURIComponent(params.name)
    const info = await getTournamentInfo(tournamentName)
    if (!info) {
        redirect('/tournaments')
    }

    const currentUserIsParticipant = session.userInfo && info.users.some(p => p.id === session.userInfo.id)
    const invitees = currentUserIsParticipant ? await getTournamentInvites(info.tournament.id) : []

    return <main style={styles.container}>
        <Box style={styles.fullWidth}>
            <Heading>{tournamentName}</Heading>
        </Box>
        <Box>
            <Subheading>Today&apos;s leaderboard</Subheading>
            <div style={styles.placeholder} />
        </Box>
        <Box>
            <Subheading>This week</Subheading>
            <div style={styles.placeholder} />
        </Box>
        <Box style={styles.fullWidth}>
            <Subheading>All time stats</Subheading>
            <div style={styles.placeholder} />
        </Box>
        <Box>
            <Subheading>Players</Subheading>
            {info.users.map(p => <p key={p.id}>{p.name}</p>)}
        </Box>
        {currentUserIsParticipant && <Box>
            <Subheading>Invite participants</Subheading>
            {invitees.map(i => <InviteRow key={i.id} invite={i} tournamentName={info.tournament.name} />)}
            <InviteToTournamentForm tournamentID={info.tournament.id} userID={session.userInfo.id} tournamentName={info.tournament.name} />
            <LeaveTournamentForm tournamentID={info.tournament.id} tournamentName={tournamentName} userID={session.userInfo.id} isLastUser={info.users.length === 1} />
        </Box>
        }
    </main >
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
    },
    fullWidth: {
        gridColumn: '1 / -1'
    },
    placeholder: {
        width: '100%',
        height: '200px',
        backgroundColor: 'gray'
    }
}