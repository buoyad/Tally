import { type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { createRefreshToken, verifyAccessToken } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import * as db from '@/app/lib/db';

const secretKey = process.env.AUTH_SECRET!;

function login(req: NextRequest) {
    if (req.method !== 'GET') {
        return new Response("use GET to login", { status: 405 })
    }

    // extract token from request body
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = verifyAccessToken(token)
    if (!email) {
        return new Response("Invalid token", { status: 401 })
    }

    try {
        // set cookies
        const refreshToken = createRefreshToken()
        db.updateUser(email, email, refreshToken)
        console.log('db updateUser success')
    } catch (error) {
        console.log('error in db.updateUser')
        console.log(error)
    }

    redirect('/user')
}

export { login as GET, login as POST }
