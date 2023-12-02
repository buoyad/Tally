import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/auth"
import { redirect } from "next/navigation"

export async function redirectIfLoggedIn(toPath?: string) {
    const session = await getServerSession(authOptions)
    if (session?.user) {
        redirect(toPath || '/user')
    }
}