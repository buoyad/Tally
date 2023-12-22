import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(tz)

export const displaySeconds = (seconds: number) => {
    // convert seconds to '00:00' format
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    const remainderStr = remainder === Math.floor(remainder) ? remainder.toString() : remainder.toFixed(1)
    return `${minutes}:${remainder < 10 ? '0' : ''}${remainderStr}`
}

export const displayScoreDate = (date: string) => {
    const day = dayjs(date)
    let fmt = ''
    if (day.year() === dayjs().year()) fmt += day.format('dddd, MMMM D')
    else fmt += day.format('dddd, MMMM D YYYY')

    return fmt
}

export const currentPuzzleDate = () => {
    const now = dayjs().tz('America/New_York')
    if (now.hour() < 22) return now.format('YYYY-MM-DD')
    return now.add(1, 'day').format('YYYY-MM-DD')
}