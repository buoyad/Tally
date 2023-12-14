import { Pool, QueryResult, types } from 'pg'
import log from './log'
import { UserInfo, Tournament, Invite, Score, SentEmail, SentEmailType, UserStats, PuzzleType } from './types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { unstable_cache as _cache } from 'next/cache'
import * as C from './constants'
dayjs.extend(utc)
dayjs.extend(tz)

const skipCache = process.env.SKIP_CACHE === "true"

type Callback = (...args: any[]) => Promise<any>;
function cache<T extends Callback>(cb: T, keyParts?: string[], options?: {
    revalidate?: number | false;
    tags?: string[];
}): T {
    return skipCache ? cb : _cache(cb, keyParts, options)
};

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
    log.info('createUser: %s', email)
    const res = await pool.query<UserInfo>(`INSERT INTO userinfo (email, name) VALUES (LOWER($1), $2) RETURNING *`, [email, name])
    return res.rows[0]
}

export const getUser = cache(async (email: string) => {
    log.info('cache miss: getUser %s', email)
    const res = await pool.query<UserInfo>(`SELECT * FROM userinfo WHERE LOWER(email) = LOWER($1)`, [email])
    return res.rows[0]
})

export const getUserByName = cache(async (name: string) => {
    log.info('cache miss: getUserByName: %s', name)
    const res = await pool.query<UserInfo>(`SELECT * FROM userinfo WHERE LOWER(name) = LOWER($1)`, [name])
    return res.rows[0]
})

export const changeUsername = async (id: number, newName: string) => {
    log.info('changeUsername: %d %s', id, newName)
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
    log.info('createTournament: %s', name)
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
    log.info('leaveTournament: %d %d', tournamentID, userID)
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
    log.info('cache miss: getUserTournaments %d', userID)
    const res = await pool.query<Tournament>(`SELECT * FROM tournaments WHERE id IN (SELECT tournament_id FROM user_tournament WHERE user_id = $1)`, [userID])
    return res.rows
})

export const getUserInvites = cache(async (userEmail: string) => {
    log.info('cache miss: getUserInvites %s', userEmail)
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
    log.info('cache miss: getPopularTournaments')
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
    log.info('cache miss: getTournamentInfo %s', tournamentName)
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
    log.info('addTournamentInvite: %s', inviteeEmail)
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
    log.info('removeTournamentInvite: %d', inviteID)
    await pool.query('DELETE FROM tournament_invites WHERE id = $1', [inviteID])
}

export const acceptTournamentInvite = async (inviteID: number) => {
    log.info('acceptTournamentInvite: %d', inviteID)
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

export const getTournamentInvites = cache(async (tournamentID: number) => {
    log.info('cache miss: getTournamentInvites %d', tournamentID)
    const res = await pool.query<Invite>(`SELECT * FROM tournament_invites WHERE tournament_id = $1`, [tournamentID])
    return res.rows
})

export const getTournamentInvite = async (inviteID: number) => {
    log.info('getTournamentInvite: %d', inviteID)
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
    log.info('addScore: %d %s %d %s', userID, date, score, type)
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
    log.info('cache miss: getUserScores %d', userID)
    const res = await pool.query<Score>('SELECT * FROM scores WHERE user_id = $1 ORDER BY for_day DESC', [userID])
    return res.rows
})

export const getUserStats = cache(async (userID: number): Promise<UserStats> => {
    log.info('cache miss: getUserStats %d', userID)
    const nyNow = dayjs().tz('America/New_York').hour(18)
    const recencyCutoff = dayjs().tz('America/New_York').year(nyNow.year()).month(nyNow.month()).date(nyNow.date()).hour(22).minute(0).second(0).millisecond(0).subtract(7, 'days')
    const res = await pool.query<{
        user_id: number,
        puzzle_type: PuzzleType,
        avg: string,
        recent_avg: string,
        recent_scores: string,
        total_scores: string,
        days_since_first_play: string,
        min_score: string,
        max_score: string,
        completion_rate: string,
        percentile_75: string,
        median: string,
        percentile_25: string,
    }>(`
        SELECT 
            scores.user_id, 
            scores.puzzle_type, 
            AVG(scores.score) AS avg, 
            AVG(scores.score) FILTER (WHERE scores.for_day >= $2) AS recent_avg,
            COUNT(scores.score) FILTER (WHERE scores.for_day >= $2) AS recent_scores,
            COUNT(scores.score) AS total_scores,
            MIN(scores.score) AS min_score,
            MAX(scores.score) AS max_score,
            ($3::DATE - MIN(scores.for_day) + 1) AS days_since_first_play,
            COUNT(scores.score)::numeric / ($3::DATE - MIN(scores.for_day) + 1) AS completion_rate,
            PERCENTILE_DISC(.75) WITHIN GROUP (ORDER BY scores.score) AS percentile_75, 
            PERCENTILE_DISC(.50) WITHIN GROUP (ORDER BY scores.score) AS median,
            PERCENTILE_DISC(.25) WITHIN GROUP (ORDER BY scores.score) AS percentile_25
        FROM scores
        WHERE scores.user_id = $1
        GROUP BY scores.user_id, scores.puzzle_type
    `, [userID, recencyCutoff, nyNow])
    const stats = res.rows.reduce((acc, row) => {
        acc[row.puzzle_type] = {
            avg: parseFloat(row.avg),
            recentAvg: parseFloat(row.recent_avg),
            hasTrends: parseFloat(row.recent_scores) > 3 && parseFloat(row.total_scores) > 7,
            minScore: parseFloat(row.min_score),
            maxScore: parseFloat(row.max_score),
            totalScores: parseInt(row.total_scores),
            daysSinceFirstPlay: parseInt(row.days_since_first_play),
            completionRate: parseFloat(row.completion_rate),
            percentile75: parseFloat(row.percentile_75),
            median: parseFloat(row.median),
            percentile25: parseFloat(row.percentile_25),
            hasGlobalRank: false,
            globalRank: 0,
            maxGlobalRank: 0
        }
        return acc
    }, {} as UserStats)
    const rankRes = await pool.query<{ puzzle_type: PuzzleType, rank: string, max_rank: string }>(`
        WITH ranks AS (
            SELECT 
                user_id, 
                puzzle_type, 
                RANK() OVER (
                    PARTITION BY puzzle_type ORDER BY AVG(score) ASC
                    ) AS rank 
                from scores GROUP BY user_id, puzzle_type HAVING COUNT(score) >= $1
        ), max_ranks AS (
            SELECT *, MAX(rank) OVER (PARTITION BY puzzle_type) AS max_rank FROM ranks
        )
        SELECT puzzle_type, rank, max_rank FROM max_ranks WHERE user_id = $2
    `, [C.mini.minScoresForGlobalRank, userID])

    rankRes.rows.forEach(row => {
        const stat = stats[row.puzzle_type]
        if (stat) {
            stat.hasGlobalRank = true
            stat.globalRank = parseInt(row.rank)
            stat.maxGlobalRank = parseInt(row.max_rank)
        }
    })
    return stats
})

// returns `[maxStreak, currentStreak]`. If `currentStreak` is undefined, then there is no current streak
export const getUserStreak = cache(async (userID: number, type: PuzzleType) => {
    log.info('cache miss: getUserStreak %d %s', userID, type)
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
        `, [userID, type, currentStreakCutoff.format('YYYY-MM-DD')]
    )
    return res.rows
})

export const getScoresForUsers = cache(async (userIDs: number[]) => {
    log.info('cache miss: getScoresForUsers %s', userIDs.join(','))
    const res = await pool.query<Score>('SELECT * FROM scores WHERE user_id = ANY($1) ORDER BY for_day DESC, score ASC', [userIDs])
    return res.rows
})

export const getGlobalTopScores = cache(async (type: PuzzleType) => {
    log.info('cache miss: getGlobalTopScores %s', type)
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

export const getGlobalTopPerformers = cache(async (type: PuzzleType, timePeriodDays?: number, minScoreCount: number = C.mini.minScoresForGlobalRank) => {
    log.info('cache miss: getGlobalTopPerformers %s %s', type, timePeriodDays || 'all time')
    let timePeriodCutoff
    if (timePeriodDays) {
        const nyNow = dayjs().tz('America/New_York')
        timePeriodCutoff = nyNow.subtract(timePeriodDays, 'day').format('YYYY-MM-DD')
    }
    let res: QueryResult<{ avg_score: number, score_count: number, user_name: string }>
    if (timePeriodCutoff) {
        res = await pool.query<{ avg_score: number, score_count: number, user_name: string }>(`
            SELECT 
                AVG(scores.score) AS avg_score,
                COUNT(scores.score) AS score_count,
                userinfo.name AS user_name
            FROM scores
            INNER JOIN userinfo ON scores.user_id = userinfo.id
            WHERE scores.puzzle_type = $1
            AND scores.for_day >= $2
            GROUP BY scores.user_id, userinfo.name
            HAVING COUNT(scores.score) >= $3
            ORDER BY avg_score ASC
            LIMIT 10
        `, [type, timePeriodCutoff, minScoreCount])
    } else {
        res = await pool.query<{ avg_score: number, score_count: number, user_name: string }>(`
            SELECT 
                AVG(scores.score) AS avg_score,
                COUNT(scores.score) AS score_count,
                userinfo.name AS user_name
            FROM scores
            INNER JOIN userinfo ON scores.user_id = userinfo.id
            WHERE scores.puzzle_type = $1
            GROUP BY scores.user_id, userinfo.name
            HAVING COUNT(scores.score) >= $2
            ORDER BY avg_score ASC
            LIMIT 10
        `, [type, minScoreCount])
    }
    return res.rows
})

export const getLongestStreaks = cache(async (type: PuzzleType) => {
    log.info('cache miss: getLongestStreaks %s', type)
    // a current streak is one that ends >= yesterday, if it ended yesterday the user is still considered to be on that streak
    const nyNow = dayjs().tz('America/New_York')
    let currentStreakCutoff = nyNow
    if (nyNow.hour() < 22) {
        currentStreakCutoff = currentStreakCutoff.subtract(1, 'day')
    }
    const res = await pool.query<{ user_name: string, length: number }>(`
        WITH diff AS (
            SELECT 
                user_id, 
                puzzle_type, 
                for_day, 
                for_day - LAG(for_day, 1, for_day) OVER (PARTITION BY user_id, puzzle_type ORDER BY for_day) as diff
            FROM scores
            WHERE puzzle_type = $1
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
            userinfo.name AS user_name,
            MAX(length) AS length
        FROM lengths
        INNER JOIN userinfo ON lengths.user_id = userinfo.id
        WHERE end_date >= $2
        GROUP BY lengths.user_id, userinfo.name
        ORDER BY length DESC
        LIMIT 10
    `, [type, currentStreakCutoff.format('YYYY-MM-DD')])
    return res.rows
})

export const getScore = async (scoreID: number) => {
    log.info('getScore: %d', scoreID)
    const res = await pool.query<Score>('SELECT * FROM scores WHERE id = $1', [scoreID])
    if (res.rows.length === 0) {
        throw new DBError("Score does not exist")
    }
    return res.rows[0]
}

export const deleteScore = async (scoreID: number) => {
    log.info('deleteScore: %d', scoreID)
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
