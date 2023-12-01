import { randomBytes } from 'crypto'
import { sign, verify, JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'

interface AccessToken {
    email: string
}

const emailSchema = z.string().email()

export const createAccessToken = (email: String) => sign({ email }, process.env.AUTH_SECRET!, { expiresIn: "15m" })

export const createRefreshToken = () => randomBytes(64).toString('hex')

export const verifyAccessToken = (token: string | null) => {
    if (!token) {
        return null
    }
    try {
        // verify also checks token expiry
        const decodedToken = verify(token, process.env.AUTH_SECRET!) as JwtPayload
        // sanitize email from token
        const email = emailSchema.parse(decodedToken.email)
        return email
    } catch (error) {
        return null
    }
}
