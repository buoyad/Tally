import { getMovingAverageForUsers, getScoresForUsers, getTournamentInfo, getTournamentInvites } from "@/app/lib/db"
import { Box, Heading, Subheading, Username } from "@/app/ui/components"
import { MovingAvgLineGraph } from "@/app/ui/common"
import { redirect } from "next/navigation"
import { InviteToTournamentForm, InviteRow, LeaveTournamentForm } from "./form"
import { getLoggedInUser } from "@/app/lib/hooks"
import { LeaderboardToday } from "@/app/stats"
import { PuzzleType } from "@/app/lib/types"

export default async function Page({ params }: { params: { name: string } }) {
    const session = await getLoggedInUser()
    const _tournamentName = decodeURIComponent(params.name)
    const info = await getTournamentInfo(_tournamentName)
    if (!info) {
        redirect('/tournaments')
    }

    const currentUserIsParticipant = !!session.userInfo && info.users.some(p => p.id === session.userInfo.id)
    const invitees = currentUserIsParticipant ? await getTournamentInvites(info.tournament.id) : []

    const usersByID = info.users.reduce((res, user) => {
        res[user.id] = user
        return res
    }, {} as { [key: number]: { id: number, name: string } })

    const scores = await getScoresForUsers(info.users.map(u => u.id))
    const movingAvgs = await getMovingAverageForUsers(info.users.map(u => u.id), PuzzleType.mini, 7, 60)

    return <main style={styles.container}>
        <Box style={styles.fullWidth}>
            <Heading>{info.tournament.name}</Heading>
        </Box>
        <Box>
            <Subheading>Today&apos;s leaderboard</Subheading>
            <LeaderboardToday scores={scores} usersByID={usersByID} loggedInUser={session.userInfo} currentUserIsParticipant={currentUserIsParticipant} />
        </Box>
        <Box>
            <Subheading>This week</Subheading>
            <div style={styles.placeholder} />
        </Box>
        <Box style={styles.fullWidth}>
            <Subheading>7-day moving average over the last 60 days</Subheading>
            {movingAvgs.length > 2 && <MovingAvgLineGraph avgs={movingAvgs} />}
            {movingAvgs.length <= 2 && <p>Not enough data to display a moving average.</p>}
        </Box>
        <Box>
            <Subheading>Players</Subheading>
            {info.users.map(p => <Username key={p.id} name={p.name} />)}
        </Box>
        {currentUserIsParticipant && <Box>
            <Subheading>Invite participants</Subheading>
            {invitees.map(i => <InviteRow key={i.id} invite={i} tournamentName={info.tournament.name} />)}
            <InviteToTournamentForm tournamentID={info.tournament.id} userID={session.userInfo.id} tournamentName={info.tournament.name} />
            <LeaveTournamentForm tournamentID={info.tournament.id} tournamentName={info.tournament.name} userID={session.userInfo.id} isLastUser={info.users.length === 1} />
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