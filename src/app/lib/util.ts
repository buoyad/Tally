import dayjs from 'dayjs'

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