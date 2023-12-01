import nodemailer from 'nodemailer'
import log from './log'

// validate environment variables
const emailServer = process.env.EMAIL_SERVER
const emailUser = process.env.EMAIL_USER
const emailPassword = process.env.EMAIL_PASSWORD
if (!emailServer || !emailUser || !emailPassword) {
    log.error('missing email environment variables')
    log.error(`EMAIL_SERVER: ${!!emailServer}`)
    log.error(`EMAIL_USER: ${!!emailUser}`)
    log.error(`EMAIL_PASSWORD: ${!!emailPassword}`)
    throw new Error('missing email environment variables')
}

// Create transport connecting to smtppro.zoho.com
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
})

export async function sendMagicLink(email: string, link: string) {
    const mailOptions = {
        from: `Tally <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Log in to Tally',
        text: link,
        html: `<a href="${link}">Login</a>`
    }

    const info = await transporter.sendMail(mailOptions)

    log.info('Message sent: %s', info.messageId)
}
