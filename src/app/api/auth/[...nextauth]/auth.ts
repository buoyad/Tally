
import EmailProvider from "next-auth/providers/email"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "pg"
import { AuthOptions } from "next-auth"
import { createTransport } from "nodemailer"
import * as db from "@/app/lib/db"
import log from "@/app/lib/log"
import { SentEmailType } from "@/app/lib/types"
import { randomInt } from 'crypto'

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + (process.env.NODE_ENV === "production" ? "?sslmode=require" : "")
})

const verifyEmailMaxAge = 5 * 60 // 5 minutes

const verificationTokenLength = 5
const newToken = () => {
    let token = ""
    for (let i = 0; i < verificationTokenLength; i++) {
        token += randomInt(10).toString()
    }
    return token
}

export const authOptions: AuthOptions = {
    adapter: PostgresAdapter(pool),
    providers: [
        EmailProvider({
            maxAge: verifyEmailMaxAge,
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM,
            generateVerificationToken: () => {
                return newToken()
            },
            sendVerificationRequest: async (params) => {
                const { identifier, token, provider } = params
                const transport = createTransport(provider.server)
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Your Tally login code is ${token}`,
                    text: `${token}\n\nThis code will expire in 5 minutes.\n\n`,
                    html: `${token}<br><br>This code will expire in 5 minutes.<br><br>`
                })
                const failed = result.rejected.concat(result.pending).filter(Boolean)
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
                }
                log.info(`verification email sent to ${identifier}`)
            },
        })
    ],
    pages: {
        signIn: '/login',
        verifyRequest: '/login/check-email',
        error: '/login',
    },
    callbacks: {
        async signIn(params) {
            const { email } = params.user

            if (!email) {
                // should not happen
                log.error('signIn callback: no email')
                return false
            }

            if (params.email?.verificationRequest) {
                try {
                    await db.addSentEmail(email, SentEmailType.Verify)
                } catch (error) {
                    if (error instanceof db.DBError) {
                        log.error(`signIn callback: ${error.message}`)
                    } else {
                        log.error(`signIn callback: unknown error ${error}`)
                    }
                    return false
                }
            }

            return true
        },
    },
    events: {
        async signIn(message) {
            const { isNewUser, user: { email } } = message
            if (isNewUser && email) {
                const res = await db.createUser(email, email.split("@")[0])
                log.info(`created user ${email} with id ${res.id}`)
            }
        }
    }
}