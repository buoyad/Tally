'use server'

export async function createTournament(formData: FormData) {
    const rawFormData = { name: formData.get("tournamentName") }

    console.log(rawFormData)
}