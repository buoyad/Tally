import { Pool, Client } from 'pg'

const pool = new Pool({ connectionString: process.env.POSTGRES_URL })

// updateUser creates the user if it does not exist
// and stores the user's refresh token
export async function updateUser(email: string, name: string, refreshToken: string) {
    const userResult = await pool.query('INSERT INTO users (email, name) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = $2 RETURNING *', [email, name])
    console.log(userResult)
    // const tokenResult = await sql`INSERT INTO refresh_tokens (user_id, token) VALUES (${userResult[0].id}, ${refreshToken}) ON CONFLICT (user_id) DO UPDATE SET token = ${refreshToken} RETURNING *`
}
