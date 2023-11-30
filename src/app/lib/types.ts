export type Tournament = {
    name: string,
    contestants: string[],
    shareURL: URL,
}

export type Contestant = {
    id: string,
    name: string,
}

export type Score = {
    contestantID: string,
    puzzleDate: Date,
    type: 'mini' | 'biggie',
    score: number,
}