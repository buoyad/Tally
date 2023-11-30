export type Tournament = {
    name: string,
    contestants: string[],
}

export type Contestant = {
    tournamentName: string,
    name: string,
}

export type Score = {
    tournamentName: string,
    contestantName: string,
    puzzleDate: Date,
    score: number,
}