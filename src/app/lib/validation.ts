import { z } from 'zod'

const emailSchema = z.string().email()

export const email = (value: unknown) => {
    try {
        return emailSchema.parse(value)
    } catch (error) {
        return null
    }
}