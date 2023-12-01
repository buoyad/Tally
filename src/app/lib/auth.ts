import { randomBytes } from 'crypto'
import { sign, verify, JwtPayload } from 'jsonwebtoken'
import * as validation from './validation'

interface AccessToken {
    email: string
}

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
        const email = validation.email(decodedToken.email)
        return email
    } catch (error) {
        return null
    }
}
