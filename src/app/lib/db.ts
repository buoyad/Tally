import { Pool, Client } from 'pg'
import log from './log'
import { UserInfo, Tournament, Invite, Score } from './types'

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + (process.env.NODE_ENV === "production" ? "?sslmode=require" : "")
})

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
        log.error('db.createTournament: ' + error)
        throw error
    } finally {
        client.release()
    }
}

export const leaveTournament = async (tournamentID: number, userID: number) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const participantsRes = await client.query('SELECT * FROM user_tournament WHERE tournament_id = $1', [tournamentID])
        if (participantsRes.rowCount <= 1) {
            throw new DBError("Last participant cannot leave the tournament")
        }
        await client.query('DELETE FROM user_tournament WHERE user_id = $1 AND tournament_id = $2', [userID, tournamentID])
        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        log.error('db.leaveTournament: ' + error)
        throw error
    } finally {
        client.release()
    }
}

export const getUserTournaments = async (userID: number) => {
    const res = await pool.query<Tournament>(`SELECT * FROM tournaments WHERE id IN (SELECT tournament_id FROM user_tournament WHERE user_id = $1)`, [userID])
    return res.rows
}

export const getUserInvites = async (userEmail: string) => {
    const res = await pool.query<Invite & { inviter_name: string, tournament_name: string }>(
        `SELECT tournament_invites.id, 
            tournament_invites.tournament_id, 
            tournaments.name AS tournament_name, 
            userinfo.name AS inviter_name
        FROM tournament_invites
        INNER JOIN tournaments ON tournament_invites.tournament_id = tournaments.id
        INNER JOIN userinfo ON tournament_invites.inviter_user_id = userinfo.id
        WHERE invitee_email = $1`,
        [userEmail]
    )
    return res.rows
}

export const getTournamentInfo = async (tournamentName: string) => {
    try {
        const users = await pool.query<{ id: number, name: string, tournament_created_at: Date, user_id: number, user_name: string, user_email: string, user_created_at: Date }>(
            `SELECT tournaments.id, 
                tournaments.name, 
                tournaments.created_at as tournament_created_at, 
                userinfo.id AS user_id,
                userinfo.name AS user_name,
                userinfo.email AS user_email,
                userinfo.created_at AS user_created_at
            FROM tournaments 
            INNER JOIN user_tournament ON tournaments.id = user_tournament.tournament_id 
            INNER JOIN userinfo ON user_tournament.user_id = userinfo.id 
            WHERE tournaments.name = $1`,
            [tournamentName]
        )
        if (users.rows.length === 0) {
            return null
        }
        const firstRow = users.rows[0]
        return {
            tournament: {
                id: firstRow.id,
                name: firstRow.name,
                created_at: firstRow.tournament_created_at,
            },
            users: users.rows.map(row => ({ id: row.user_id, name: row.user_name, email: row.user_email, created_at: row.user_created_at }))
        }
    } catch (error) {
        log.error('db.getTournamentInfo: ' + error)
        return null
    }
}

export const addTournamentInvite = async (inviterUserID: number, tournamentID: number, inviteeEmail: string) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        // make sure the user is not already in the tournament
        const res = await client.query<UserInfo>(
            `SELECT * FROM userinfo
            INNER JOIN user_tournament ON userinfo.id = user_tournament.user_id AND user_tournament.tournament_id = $2
            WHERE email = $1`,
            [inviteeEmail, tournamentID])
        if (res.rows.length > 0) {
            throw new DBError("User is already in the tournament")
        }
        // make sure inviter is in the tournament
        const inviterRes = await client.query(`SELECT * FROM user_tournament WHERE user_id = $1 AND tournament_id = $2`, [inviterUserID, tournamentID])
        if (inviterRes.rows.length === 0) {
            throw new DBError("Inviter is not in the tournament")
        }
        await client.query('INSERT INTO tournament_invites (inviter_user_id, tournament_id, invitee_email) VALUES ($1, $2, $3)', [inviterUserID, tournamentID, inviteeEmail])
        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        if ((error as DBErrorInternal)?.code === "23505") {
            throw new DBError("Invite already exists")
        } else {
            log.error('db.addTournamentInvite: ' + error)
            throw error
        }
    } finally {
        client.release()
    }
}

export const removeTournamentInvite = async (inviteID: number) => {
    await pool.query('DELETE FROM tournament_invites WHERE id = $1', [inviteID])
}

export const acceptTournamentInvite = async (inviteID: number) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        // make sure invitee user exists
        const inviteRes = await client.query<Invite>(`SELECT * FROM tournament_invites WHERE id = $1`, [inviteID])
        if (inviteRes.rows.length === 0) {
            throw new DBError("Invite does not exist")
        }
        const invite = inviteRes.rows[0]
        const userRes = await client.query<UserInfo>(`SELECT * FROM userinfo WHERE email = $1`, [invite.invitee_email])
        if (userRes.rows.length === 0) {
            throw new DBError("Invitee user does not exist")
        }
        const user = userRes.rows[0]
        // insert will fail if user is already in the tournament
        await client.query('INSERT INTO user_tournament (user_id, tournament_id) VALUES ($1, $2)', [user.id, invite.tournament_id])
        await client.query('DELETE FROM tournament_invites WHERE id = $1', [inviteID])
        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        log.error('db.acceptTournamentInvite: ' + error)
        if ((error as DBErrorInternal)?.code === "23505") {
            throw new DBError("User is already in the tournament")
        }
        throw error
    } finally {
        client.release()
    }
}

export const getTournamentInvites = async (tournamentID: number) => {
    const res = await pool.query<Invite>(`SELECT * FROM tournament_invites WHERE tournament_id = $1`, [tournamentID])
    return res.rows
}

export const getTournamentInvite = async (inviteID: number) => {
    const res = await pool.query<Invite>(`SELECT * FROM tournament_invites WHERE id = $1`, [inviteID])
    if (res.rows.length === 0) {
        throw new DBError("Invite does not exist")
    }
    return res.rows[0]
}

export const addScore = async (userID: number, date: string, score: number, type: 'mini' | 'biggie') => {
    try {
        await pool.query('INSERT INTO scores (user_id, for_day, score, puzzle_type) VALUES ($1, $2, $3, $4)', [userID, date, score, type])
    } catch (error) {
        if ((error as DBErrorInternal)?.code === "23505") {
            throw new DBError("Score already exists for day")
        } else {
            throw error
        }
    }
}

export const getUserScores = async (userID: number) => {
    const res = await pool.query<Score>('SELECT * FROM scores WHERE user_id = $1 ORDER BY for_day DESC', [userID])
    return res.rows
}
