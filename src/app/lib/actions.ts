'use server'
import * as validation from './validation'
import log from "./log"
import { redirect } from "next/navigation"
import * as db from "./db"
import * as Mail from './email'
import { revalidatePath } from 'next/cache'
import { getLoggedInUser } from './hooks'
import { SentEmailType } from './types'

const createTournamentSchema = validation.z.object({
    name: validation.z.string().min(3).max(32),
    userID: validation.z.coerce.number().positive(),
})
export async function createTournament(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to create a tournament" }
    }
    const rawFormData = { name: formData.get("tournamentName"), userID: formData.get('userID') }
    try {
        const data = createTournamentSchema.parse(rawFormData)
        await db.createTournament(data.name, data.userID)
        revalidatePath('/user')
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            return { message: "Enter a tournament name between 3 and 32 characters long" }
        } else if (error instanceof db.DBError) {
            return { message: error.message }
        }
        return { message: 'An unknown error occurred' }
    }
    // TODO: redirect to tournament page
    redirect('/user')
}

const changeUsernameSchema = validation.z.object({
    id: validation.z.coerce.number().positive(),
    username: validation.z.string().min(3).max(20),
})
export async function changeUsername(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to change usernames" }
    }

    try {
        const rawFormData = { username: formData.get("username"), id: formData.get('id') }
        const data = changeUsernameSchema.parse(rawFormData)
        if (data.id !== session.userInfo.id) {
            return { message: "You can't change someone else's username" }
        }
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

const inviteToTournamentSchema = validation.z.object({
    userID: validation.z.coerce.number().positive(),
    tournamentID: validation.z.coerce.number().positive(),
    tournamentName: validation.z.string().min(3).max(32),
    email: validation.z.string().email(),
})
export async function inviteToTournament(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to invite someone to a tournament" }
    }

    let data
    try {
        const rawFormData = { userID: formData.get('userID'), tournamentID: formData.get('tournamentID'), tournamentName: formData.get('tournamentName'), email: formData.get('email') }
        data = inviteToTournamentSchema.parse(rawFormData)
        if (data.userID !== session.userInfo.id) {
            return { message: "You can't claim to be someone else creating a tournament invite" }
        }

        // database checks that data.userID is in the tournament and that
        // data.email is not already in it.
        await db.addTournamentInvite(data.userID, data.tournamentID, data.email)

        await db.addSentEmail(data.email, SentEmailType.Invite, data.userID)
        await Mail.sendInviteEmail(data.email, data.tournamentName, session.userInfo.name)
        // if the email transport failed to send for some reason, the db will
        // think we successfully sent it an disallow retries for a time. TODO:
        // drop the row if the email fails to be sent?
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            return { message: "Enter a valid email" }
        } else if (error instanceof db.DBError) {
            return { message: error.message }
        } else if (error instanceof Mail.MailError) {
            return { message: error.message }
        }
        log.error('inviteToTournament: unknown error: ' + error)
        return { message: 'An unknown error occurred' }
    } finally {
        if (data?.tournamentName) revalidatePath(`/tournaments/${data.tournamentName}`)
    }

}

const removeInviteSchema = validation.z.object({
    tournamentName: validation.z.string().min(3).max(32),
    inviteID: validation.z.coerce.number().positive(),
})
export async function removeInvite(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to remove an invite" }
    }

    let data
    try {
        const rawFormData = { tournamentName: formData.get('tournamentName'), inviteID: formData.get('inviteID') }
        data = removeInviteSchema.parse(rawFormData)

        const { tournamentName } = data

        const invite = await db.getTournamentInvite(data.inviteID)
        const tournaments = await db.getUserTournaments(session.userInfo.id)
        const userIsInTournament = tournaments.some(t => (t.name === tournamentName))
        const userIsInvitee = (invite.invitee_email === session.userInfo.email)
        if (!(userIsInTournament || userIsInvitee)) {
            return { message: "You aren't authorized to make this change" }
        }

        await db.removeTournamentInvite(data.inviteID)
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            // should not happen
            log.error('removeInvite: validation error: ' + error)
            return { message: "An error occurred" }
        } else if (error instanceof db.DBError) {
            return { message: "An error occurred, please try again" }
        }
        log.error('inviteToTournament: unknown error: ' + error)
        return { message: 'An unknown error occurred' }
    }

    revalidatePath(`/tournaments/${data.tournamentName}`)
}

const acceptInviteSchema = validation.z.object({
    inviteID: validation.z.coerce.number().positive(),
    userID: validation.z.coerce.number().positive(),
})
export async function acceptInvite(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to accept an invite" }
    }

    try {
        const rawFormData = { inviteID: formData.get('inviteID'), userID: formData.get('userID') }
        const data = acceptInviteSchema.parse(rawFormData)
        if (data.userID !== session.userInfo.id) {
            return { message: "This invite is not for you" }
        }
        const invite = await db.getTournamentInvite(data.inviteID)
        if (invite.invitee_email !== session.userInfo.email) {
            return { message: "This invite is not for you" }
        }
        await db.acceptTournamentInvite(data.inviteID)
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            // should not happen
            log.error('acceptInvite: validation error: ' + error)
            return { message: "An error occurred" }
        } else if (error instanceof db.DBError) {
            return { message: error.message }
        }
        log.error('acceptInvite: unknown error: ' + error)
        return { message: 'An unknown error occurred' }
    }

    revalidatePath(`/user`)
}

const leaveTournamentSchema = validation.z.object({
    tournamentID: validation.z.coerce.number().positive(),
    tournamentName: validation.z.string().min(3).max(32),
    userID: validation.z.coerce.number().positive(),
})
export async function leaveTournament(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to leave a tournament" }
    }
    let data
    try {
        const rawFormData = { tournamentID: formData.get('tournamentID'), tournamentName: formData.get('tournamentName'), userID: formData.get('userID') }
        data = leaveTournamentSchema.parse(rawFormData)
        if (data.userID !== session.userInfo.id) {
            return { message: "You can't leave a tournament for someone else" }
        }
        await db.leaveTournament(data.tournamentID, data.userID)
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            log.error('leaveTournament: validation error: ' + error)
            return { message: "An error occurred" }
        } else if (error instanceof db.DBError) {
            return { message: error.message }
        }
        log.error('leaveTournament: unknown error: ' + error)
        return { message: 'An unknown error occurred' }
    }

    revalidatePath(`/user`)
    revalidatePath(`/tournaments/${data.tournamentName}`)
}

const submitScoreSchema = validation.z.object({
    minutes: validation.z.coerce.number(),
    seconds: validation.z.coerce.number(),
    date: validation.z.string(),
    userID: validation.z.coerce.number().positive(),
    submitAnother: validation.z.coerce.boolean(),
})
export async function submitScore(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to submit a score" }
    }
    let data
    try {
        const rawFormData = { minutes: formData.get('minutes'), seconds: formData.get('seconds'), date: formData.get('date'), userID: formData.get('userID'), submitAnother: formData.get('submitAnother') }
        data = submitScoreSchema.parse(rawFormData)
        if (data.userID !== session.userInfo.id) {
            return { message: "You can't submit a score for someone else" }
        }
        const seconds = (data.minutes * 60) + data.seconds
        if (seconds === 0) {
            return { message: "You can't submit a score of 0 seconds" }
        }
        await db.addScore(data.userID, data.date, seconds, 'mini')
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            log.error('submitScore: validation error: ' + error)
            return { message: "An error occurred" }
        } else if (error instanceof db.DBError) {
            return { message: error.message }
        }
        log.error('submitScore: unknown error: ' + error)
        return { message: 'An unknown error occurred' }
    }

    revalidatePath(`/user`)

    if (!data.submitAnother) {
        redirect('/user?message=score')
    }
}

const deleteScoreSchema = validation.z.object({
    scoreID: validation.z.coerce.number().positive(),
    userID: validation.z.coerce.number().positive(),
})
export async function deleteScore(_: any, formData: FormData) {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        return { message: "You must be logged in to delete a score" }
    }
    let data
    try {
        const rawFormData = { scoreID: formData.get('scoreID'), userID: formData.get('userID') }
        data = deleteScoreSchema.parse(rawFormData)
        if (data.userID !== session.userInfo.id) {
            return { message: "You can't delete a score for someone else" }
        }
        const score = await db.getScore(data.scoreID)
        if (score.user_id !== session.userInfo.id) {
            return { message: "You can't delete a score for someone else" }
        }
        await db.deleteScore(data.scoreID)
    } catch (error) {
        if (error instanceof validation.z.ZodError) {
            log.error('deleteScore: validation error: ' + error)
            return { message: "An error occurred" }
        } else if (error instanceof db.DBError) {
            return { message: error.message }
        }
        log.error('deleteScore: unknown error: ' + error)
        return { message: 'An unknown error occurred' }
    }

    revalidatePath(`/user`)
}
