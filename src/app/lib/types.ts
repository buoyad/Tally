export type Tournament = {
    id: string,
    name: string,
    contestantIDs: string[],
}

export type Contestant = {
    id: string,
    name: string,
}

export type Score = {
    contestantID: string,
    puzzleDate: Date,
    score: number,
}