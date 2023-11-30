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
    tournamentName: string,
    contestantName: string,
    puzzleDate: Date,
    score: number,
}