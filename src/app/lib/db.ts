import { Pool, Client } from 'pg'
import log from './log'

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + (process.env.NODE_ENV === "production" ? "?sslmode=require" : "")
})

interface UserInfo {
    id: number,
    name: string,
    email: string,
    created_at: Date,
}

interface DBErrorInternal extends Error {
    code: string
}

export class DBError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DBError"
    }
}

export const createUser = async (email: string, name: string) => {
    const res = await pool.query<UserInfo>(`INSERT INTO userinfo (email, name) VALUES ($1, $2) RETURNING *`, [email, name])
    return res.rows[0]
}

export const getUser = async (email: string) => {
    const res = await pool.query<UserInfo>(`SELECT * FROM userinfo WHERE email = $1`, [email])
    return res.rows[0]
}

export const changeUsername = async (id: number, newName: string) => {
    try {
        const res = await pool.query<UserInfo>(`UPDATE userinfo SET name = $1 WHERE id = $2 RETURNING *`, [newName, id])
        return res.rows[0]
    } catch (error) {
        if ((error as DBErrorInternal)?.code === "23505") {
            throw new DBError("Username already exists")
        } else {
            throw error
        }
    }
}
