'use server'
import { createAccessToken } from "./auth"
import { z } from 'zod'

const emailSchema = z.string().email()

export async function createTournament(formData: FormData) {
    const rawFormData = { name: formData.get("tournamentName") }

    console.log(rawFormData)
}

export async function loginUser(formData: FormData) {
    const rawFormData = {
        email: formData.get("email"),
    }

    const email = emailSchema.parse(rawFormData.email)
    const accessToken = createAccessToken(email)


    const magicLink = `http://localhost:3000/api/login?token=${accessToken}`
    console.log(magicLink)
}