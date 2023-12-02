'use server'
import * as validation from './validation'
import log from "./log"
import { redirect } from "next/navigation"

export async function createTournament(formData: FormData) {
    const rawFormData = { name: formData.get("tournamentName") }

    log.debug(rawFormData)
}