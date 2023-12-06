export interface UserInfo {
    id: number,
    name: string,
    email: string,
    created_at: Date,
}

export interface Tournament {
    id: number,
    name: string,
    created_at: Date,
}

export interface Invite {
    id: number,
    tournament_id: number,
    invitee_email: string,
    inviter_user_id: number,
    rejected: boolean,
}

export interface Score {
    id: number,
    user_id: number,
    for_day: string,
    score: number,
    puzzle_type: 'mini' | 'biggie',
}

export enum SentEmailType {
    Verify = "verify",
    Invite = "invite",
}

export type SentEmail = {
    id: number,
    email: string,
    sent_at: Date,
    sending_user_id: number | null,
    email_type: SentEmailType,
}