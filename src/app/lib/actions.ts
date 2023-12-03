'use server'
import * as validation from './validation'
import log from "./log"
import { redirect } from "next/navigation"
import * as db from "./db"
import { revalidatePath } from 'next/cache'

export async function createTournament(formData: FormData) {
    const rawFormData = { name: formData.get("tournamentName") }

    log.debug(rawFormData)
}

const changeUsernameSchema = validation.z.object({
    id: validation.z.coerce.number().positive(),
    username: validation.z.string().min(3).max(20),
})
export async function changeUsername(prevState: any, formData: FormData) {
    try {
        const rawFormData = { username: formData.get("username"), id: formData.get('id') }
        console.log(rawFormData)
        const data = changeUsernameSchema.parse(rawFormData)
        await db.changeUsername(data.id, data.username)
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            return { message: "Enter a username between 3 and 20 characters long" }
        } else if (error instanceof db.DBError) {
            return { message: error.message }
        }
        log.error('changeUsername: unknown error: ' + error)
        return { message: 'An unknown error occurred' }
    }

    revalidatePath('/user')
}