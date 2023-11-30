export type Tournament = {
    name: string,
    shareURL: URL,
}

export type User = {
    id: string,
    name: string,
}

export type Score = {
    userID: string,
    puzzleDate: Date,
    type: 'mini' | 'biggie',
    score: number,
}