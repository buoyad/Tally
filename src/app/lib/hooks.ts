import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/auth"
import { redirect } from "next/navigation"
import * as db from "./db"

export async function redirectIfLoggedIn(toPath?: string, params?: string) {
    const { session, userInfo } = await getLoggedInUser()
    if (session?.user) {
        redirect(toPath || `/${userInfo.name}${params}`)
    }
}

export const getLoggedInUser = async (redirectIfLoggedOut: boolean = false) => {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        if (redirectIfLoggedOut) {
            redirect('/login')
        }
        return { session: null, userInfo: null }
    }
    const email = session.user!.email || ''
    const userInfo = await db.getUser(email)
    return { session, userInfo }
}

export const getUserTournaments = async (userID: number) => {
    return await db.getUserTournaments(userID)
}

export const getTournamentInfo = async (tournamentName: string) => {
    // TODO: maybe don't return participant emails if the user is not logged in
    // as a participant
    const res = await db.getTournamentInfo(tournamentName)
}