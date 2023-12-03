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

interface Tournament {
    id: number,
    name: string,
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

export const createTournament = async (name: string, userID: number) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const tRes = await client.query<Tournament>('INSERT INTO tournaments (name) VALUES ($1) RETURNING *', [name])
        const tournament = tRes.rows[0]
        await client.query('INSERT INTO user_tournament (user_id, tournament_id) VALUES ($1, $2)', [userID, tournament.id])
        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

export const getUserTournaments = async (userID: number) => {
    const res = await pool.query<Tournament>(`SELECT * FROM tournaments WHERE id IN (SELECT tournament_id FROM user_tournament WHERE user_id = $1)`, [userID])
    return res.rows
}
