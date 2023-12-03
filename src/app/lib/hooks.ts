import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/auth"
import { redirect } from "next/navigation"
import { getUser } from "./db"

export async function redirectIfLoggedIn(toPath?: string) {
    const session = await getServerSession(authOptions)
    if (session?.user) {
        redirect(toPath || '/user')
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
    const userInfo = await getUser(email)
    return { session, userInfo }
}