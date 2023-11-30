export type Tournament = {
    name: string,
    contestantIDs: string[],
}

export type Contestant = {
    name: string,
}

export type Score = {
    tournamentName: string,
    contestantName: string,
    puzzleDate: Date,
    score: number,
}