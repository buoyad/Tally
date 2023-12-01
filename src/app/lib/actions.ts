'use server'
import { createAccessToken } from "./auth"
import * as validation from './validation'
import { sendMagicLink } from './email'
import log from "./log"
import { redirect } from "next/navigation"

export async function createTournament(formData: FormData) {
    const rawFormData = { name: formData.get("tournamentName") }

    log.debug(rawFormData)
}

export async function loginUser(formData: FormData) {
    const rawFormData = {
        email: formData.get("email"),
    }

    const email = validation.email(rawFormData.email)
    if (!email) {
        log.debug("Invalid email")
        return
    }
    const accessToken = createAccessToken(email)


    const magicLink = `${process.env.AUTH_URL}/api/login?token=${accessToken}`
    await sendMagicLink(email, magicLink)
    redirect("/login/check-email")
}