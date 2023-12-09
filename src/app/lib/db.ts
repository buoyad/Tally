import { Pool, QueryResult, types } from 'pg'
import log from './log'
import { UserInfo, Tournament, Invite, Score, SentEmail, SentEmailType, UserStats, PuzzleType } from './types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { unstable_cache as cache } from 'next/cache'
dayjs.extend(utc)
dayjs.extend(tz)

// don't transform DATE column type, just return string YYYY-MM-DD
types.setTypeParser(types.builtins.DATE, (val) => val)
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
    const res = await pool.query<UserInfo>(`INSERT INTO userinfo (email, name) VALUES (LOWER($1), $2) RETURNING *`, [email, name])
    return res.rows[0]
}

export const getUser = cache(async (email: string) => {
    const res = await pool.query<UserInfo>(`SELECT * FROM userinfo WHERE LOWER(email) = LOWER($1)`, [email])
    return res.rows[0]
})

export const changeUsername = async (id: number, newName: string) => {
    try {
        const res = await pool.query<UserInfo>(`UPDATE userinfo SET name = $1 WHERE id = $2 RETURNING *`, [newName, id])
        return res.rows[0]
    } catch (error) {
        if ((error as DBErrorInternal)?.code === "23505") {
            throw new DBError("A user with that name already exists")
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
        if ((error as DBErrorInternal)?.code === "23505") {
            throw new DBError("A tournament with that name already exists")
        }
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

export const getUserTournaments = cache(async (userID: number) => {
    const res = await pool.query<Tournament>(`SELECT * FROM tournaments WHERE id IN (SELECT tournament_id FROM user_tournament WHERE user_id = $1)`, [userID])
    return res.rows
})

export const getUserInvites = cache(async (userEmail: string) => {
    const res = await pool.query<Invite & { inviter_name: string, tournament_name: string }>(
        `SELECT tournament_invites.id, 
            tournament_invites.tournament_id, 
            tournaments.name AS tournament_name, 
            userinfo.name AS inviter_name
        FROM tournament_invites
        INNER JOIN tournaments ON tournament_invites.tournament_id = tournaments.id
        INNER JOIN userinfo ON tournament_invites.inviter_user_id = userinfo.id
        WHERE LOWER(invitee_email) = LOWER($1)`,
        [userEmail]
    )
    return res.rows
})

export const getPopularTournaments = cache(async () => {
    const res = await pool.query<Tournament & { num_participants: number }>(`
        SELECT tournaments.id, tournaments.name, tournaments.created_at, COUNT(user_tournament.user_id)::int AS num_participants
        FROM tournaments
        INNER JOIN user_tournament ON tournaments.id = user_tournament.tournament_id
        GROUP BY tournaments.id
        ORDER BY num_participants DESC, tournaments.created_at ASC
        LIMIT 10
    `)
    return res.rows
})

export const getTournamentInfo = cache(async (tournamentName: string) => {
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
            WHERE LOWER(tournaments.name) = LOWER($1)`,
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
})

export const addTournamentInvite = async (inviterUserID: number, tournamentID: number, inviteeEmail: string) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        // make sure the user is not already in the tournament
        const res = await client.query<UserInfo>(
            `SELECT * FROM userinfo
            INNER JOIN user_tournament ON userinfo.id = user_tournament.user_id AND user_tournament.tournament_id = $2
            WHERE LOWER(email) = LOWER($1)`,
            [inviteeEmail, tournamentID])
        if (res.rows.length > 0) {
            throw new DBError("User is already in the tournament")
        }
        // make sure inviter is in the tournament
        const inviterRes = await client.query(`SELECT * FROM user_tournament WHERE user_id = $1 AND tournament_id = $2`, [inviterUserID, tournamentID])
        if (inviterRes.rows.length === 0) {
            throw new DBError("Inviter is not in the tournament")
        }
        await client.query('INSERT INTO tournament_invites (inviter_user_id, tournament_id, invitee_email) VALUES ($1, $2, LOWER($3))', [inviterUserID, tournamentID, inviteeEmail])
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
        const userRes = await client.query<UserInfo>(`SELECT * FROM userinfo WHERE LOWER(email) = LOWER($1)`, [invite.invitee_email])
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
    const res = await pool.query<Invite & { tournament_name: string }>(`
        SELECT 
            tournament_invites.id, 
            tournament_invites.tournament_id, 
            tournament_invites.invitee_email, 
            tournament_invites.inviter_user_id,
            tournaments.name AS tournament_name 
        FROM tournament_invites 
        INNER JOIN tournaments ON tournament_invites.tournament_id = tournaments.id
        WHERE tournament_invites.id = $1
        `, [inviteID])
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

export const getUserScores = cache(async (userID: number) => {
    const res = await pool.query<Score>('SELECT * FROM scores WHERE user_id = $1 ORDER BY for_day DESC', [userID])
    return res.rows
})

export const getUserStats = cache(async (userID: number): Promise<UserStats> => {
    const nyNow = dayjs().tz('America/New_York')
    const recencyCutoff = dayjs().tz('America/New_York').year(nyNow.year()).month(nyNow.month()).date(nyNow.date()).hour(22).minute(0).second(0).millisecond(0).subtract(7, 'days')
    const res = await pool.query<{ user_id: number, puzzle_type: PuzzleType, avg: string, recent_avg: string, recent_scores: string, total_scores: string }>(`
        SELECT 
            scores.user_id, 
            scores.puzzle_type, 
            AVG(scores.score) AS avg, 
            AVG(scores.score) FILTER (WHERE scores.for_day >= $2) AS recent_avg,
            COUNT(scores.score) FILTER (WHERE scores.for_day >= $2) AS recent_scores,
            COUNT(scores.score) AS total_scores
        FROM scores
        WHERE scores.user_id = $1
        GROUP BY scores.user_id, scores.puzzle_type
    `, [userID, recencyCutoff])
    const stats = res.rows.reduce((acc, row) => {
        acc[row.puzzle_type] = {
            avg: parseFloat(row.avg),
            recentAvg: parseFloat(row.recent_avg),
            hasTrends: parseFloat(row.recent_scores) > 3 && parseFloat(row.total_scores) > 7,
        }
        return acc
    }, {} as UserStats)
    return stats
})

// returns `[maxStreak, currentStreak]`. If `currentStreak` is undefined, then there is no current streak
export const getUserStreak = cache(async (userID: number, type: PuzzleType) => {
    // get max streak and current streak for puzzle type
    // a current streak is one that ends >= yesterday, if it ended yesterday the user is still considered to be on that streak
    const nyNow = dayjs().tz('America/New_York')
    let currentStreakCutoff = nyNow
    if (nyNow.hour() < 22) {
        currentStreakCutoff = currentStreakCutoff.subtract(1, 'day')
    }
    const res = await pool.query<{ start_date: string, end_date: string, length: number, current: boolean }>(
        `
        WITH diff AS (
            SELECT 
                user_id, 
                puzzle_type, 
                for_day, 
                for_day - LAG(for_day, 1, for_day) OVER (PARTITION BY user_id, puzzle_type ORDER BY for_day) as diff
            FROM scores
            WHERE user_id = $1 AND puzzle_type = $2
        ),
        groups AS (
            SELECT 
                user_id, 
                puzzle_type,
                for_day, 
                SUM(CASE WHEN diff = 1 THEN 0 ELSE 1 END) OVER (PARTITION BY user_id, puzzle_type ORDER BY for_day) as group_id
            FROM diff
        ),
        lengths AS (
            SELECT 
                user_id, 
                puzzle_type, 
                group_id, 
                MAX(for_day) - MIN(for_day) + 1 as length, 
                MIN(for_day) as start_date, 
                MAX(for_day) as end_date
            FROM groups
            GROUP BY user_id, puzzle_type, group_id
        )
        SELECT 
            start_date, 
            end_date, 
            length,
            end_date >= $3 AS current
        FROM lengths
        WHERE length = (SELECT MAX(length) FROM lengths) OR
            end_date >= $3
        ORDER BY current ASC
        `, [userID, type, currentStreakCutoff]
    )
    return res.rows
})

export const getScoresForUsers = cache(async (userIDs: number[]) => {
    const res = await pool.query<Score>('SELECT * FROM scores WHERE user_id = ANY($1) ORDER BY for_day DESC, score ASC', [userIDs])
    return res.rows
})

export const getGlobalTopScores = cache(async (type: PuzzleType) => {
    const nyNow = dayjs().tz('America/New_York')
    let recencyCutoff = nyNow.format('YYYY-MM-DD')
    if (nyNow.hour() >= 22) {
        recencyCutoff = nyNow.add(1, 'day').format('YYYY-MM-DD')
    }
    const res = await pool.query<Score & { user_name: string }>(`
        SELECT scores.*, userinfo.name AS user_name
        FROM scores
        INNER JOIN userinfo ON scores.user_id = userinfo.id
        WHERE scores.puzzle_type = $1
        AND scores.for_day = $2
        ORDER BY scores.score ASC
        LIMIT 10
    `, [type, recencyCutoff])
    return res.rows
})

export const getScore = cache(async (scoreID: number) => {
    const res = await pool.query<Score>('SELECT * FROM scores WHERE id = $1', [scoreID])
    if (res.rows.length === 0) {
        throw new DBError("Score does not exist")
    }
    return res.rows[0]
})

export const deleteScore = async (scoreID: number) => {
    await pool.query('DELETE FROM scores WHERE id = $1', [scoreID])
}

const sentEmailTimeout = {
    [SentEmailType.Verify]: 60, // 1 minute
    [SentEmailType.Invite]: 60, // 1 minute
}

// addSentEmail will throw an error if an email of this type was sent too recently
export const addSentEmail = async (email: string, type: SentEmailType, sendingUserID?: number) => {
    if (sentEmailTimeout[type] === undefined) {
        throw new Error('Invalid email type')
    }

    let res: QueryResult<SentEmail>
    if (sendingUserID) {
        res = await pool.query<SentEmail>(`
            SELECT * FROM sent_emails
                WHERE LOWER(email) = LOWER($1)
                AND email_type = $2
                AND sending_user_id = $3
                ORDER BY sent_at DESC
                LIMIT 1
        `, [email, type, sendingUserID])
    } else {
        res = await pool.query<SentEmail>(`
            SELECT * FROM sent_emails
                    WHERE LOWER(email) = LOWER($1)
                    AND email_type = $2
                    ORDER BY sent_at DESC
                    LIMIT 1
        `, [email, type])
    }
    if (res.rows.length > 0) {
        const lastSent = res.rows[0]
        const now = new Date()
        const timeout = sentEmailTimeout[type]
        if ((now.getTime() - lastSent.sent_at.getTime()) < (timeout * 1000)) {
            throw new DBError("An email was already sent to that address too recently. Wait a minute and try again.")
        }
    }
    if (sendingUserID) {
        await pool.query('INSERT INTO sent_emails (email, email_type, sending_user_id) VALUES ($1, $2, $3)', [email, type, sendingUserID])
    } else {
        await pool.query('INSERT INTO sent_emails (email, email_type) VALUES ($1, $2)', [email, type])
    }
}
