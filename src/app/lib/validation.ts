import { z } from 'zod'

const emailSchema = z.string().email()
const numberSchema = z.number().positive().finite()

export { z }

export const email = (value: unknown) => {
    try {
        return emailSchema.parse(value)
    } catch (error) {
        return null
    }
}

export const number = (value: unknown) => {
    try {
        return numberSchema.parse(value)
    } catch (error) {
        return null
    }
}
