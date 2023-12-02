import NextAuth, { AuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + (process.env.NODE_ENV === "production" ? "?sslmode=require" : "")
})

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
            from: process.env.EMAIL_FROM
        })
    ],
    pages: {
        signIn: '/login',
        verifyRequest: '/login/check-email',
    }
    // callbacks: {
    //     async redirect(params) {
    //         return params.baseUrl + '/user'
    //     },
    // }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }