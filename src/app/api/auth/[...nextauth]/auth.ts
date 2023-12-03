
import EmailProvider from "next-auth/providers/email"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "pg"
import { AuthOptions } from "next-auth"
import { createTransport } from "nodemailer"
import log from "@/app/lib/log"

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + (process.env.NODE_ENV === "production" ? "?sslmode=require" : "")
})

const verifyEmailMaxAge = 15 * 60 // 15 minutes

export const authOptions: AuthOptions = {
    adapter: PostgresAdapter(pool),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: async (params) => {
                const { identifier, url, provider } = params
                const transport = createTransport(provider.server)
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Sign in to Tally`,
                    text: `${url}\nThis link will expire in 15 minutes.\n\n`,
                    html: `<a href="${url}">Sign in to Tally</a><br><br>This link will expire in 15 minutes.<br><br>`
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
    }
}