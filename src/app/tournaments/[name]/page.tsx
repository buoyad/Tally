import { getTournamentInfo, getTournamentInvites } from "@/app/lib/db"
import { Heading, Subheading } from "@/app/ui/components"
import { redirect } from "next/navigation"
import { InviteToTournamentForm, InviteRow } from "./form"
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

    return <main>
        <Heading>{tournamentName}</Heading>
        <Subheading>Players</Subheading>
        <ul>
            {info.users.map(p => <li key={p.id}>{p.name}</li>)}
        </ul>
        <Subheading>Invite participants</Subheading>
        <ul style={{ marginBottom: '16px' }}>
            {invitees.map(i => <InviteRow key={i.id} invite={i} tournamentID={info.tournament.id} tournamentName={info.tournament.name} />)}
        </ul>
        {currentUserIsParticipant &&
            <InviteToTournamentForm tournamentID={info.tournament.id} userID={session.userInfo.id} tournamentName={info.tournament.name} />}
    </main>
}