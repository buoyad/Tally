import { Pool, Client } from 'pg'
import log from './log'

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + (process.env.NODE_ENV === "production" ? "?sslmode=require" : "")
})
