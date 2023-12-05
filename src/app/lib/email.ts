import nodemailer from 'nodemailer'
import log from './log'

const emailServerHost = process.env.EMAIL_SERVER_HOST
const emailServerPort = parseInt(process.env.EMAIL_SERVER_PORT || '0')
const emailServerUser = process.env.EMAIL_SERVER_USER
const emailServerPassword = process.env.EMAIL_SERVER_PASSWORD
const emailFrom = process.env.EMAIL_FROM
if (!emailServerHost || emailServerPort === 0 || !emailServerUser || !emailServerPassword || !emailFrom) {
    log.error('missing email environment variables')
    log.error(`EMAIL_SERVER_HOST: ${!!emailServerHost}`)
    log.error(`EMAIL_SERVER_PORT: ${!!emailServerPort}`)
    log.error(`EMAIL_USER: ${!!emailServerUser}`)
    log.error(`EMAIL_PASSWORD: ${!!emailServerPassword}`)
    log.error(`EMAIL_FROM: ${!!emailFrom}`)
    throw new Error('missing email environment variables')
}

const transport = nodemailer.createTransport({
    host: emailServerHost,
    port: emailServerPort,
    auth: {
        user: emailServerUser,
        pass: emailServerPassword,
    },
    from: emailFrom,
})

export class MailError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MailError'
    }
}

export async function sendInviteEmail(email: string, tournamentName: string, inviterName: string) {
    const link = `${process.env.NEXTAUTH_URL}/login?inviteEmail=${email}`
    const mailOptions = {
        from: `Tally <${emailFrom}>`,
        to: email,
        subject: `You've been invited to ${tournamentName} on Tally`,
        text: `${inviterName} invited you to compete in ${tournamentName} on Tally. Click the link below to get started.\n\n${link}\n\n`,
        html: `${inviterName} invited you to compete in ${tournamentName} on Tally.<br />
            <a href="${link}">Click here to get started.</a><br /><br />`
    }

    const result = await transport.sendMail(mailOptions)
    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
        log.error(`sendInviteEmail: email(s) (${failed.join(", ")}) could not be sent`)
        throw new MailError(`Failed to send email, please try again`)
    }
    log.info(`sendInviteEmail: invite to tournament ${tournamentName} email sent to ${email}`)
}