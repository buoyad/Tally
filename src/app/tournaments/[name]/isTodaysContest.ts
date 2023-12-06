import { PluginFunc } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'

dayjs.extend(utc)
dayjs.extend(timezone)

const plugin: PluginFunc = (option, dayjsClass, dayjsFactory) => {
    dayjsClass.prototype.isTodaysContest = function () {
        // `this` is a date at midnight UTC on the day of the contest
        // extract the day, month, and year fields and create new dates representing 10PM ET on the day before and 10PM ET on the day of the contest
        // and check if `now` is between those two dates
        const day = this.date()
        const month = this.month()
        const year = this.year()
        const today = dayjsFactory().tz('America/New_York').year(year).month(month).date(day).hour(22).minute(0).second(0).millisecond(0)
        const yesterday = dayjsFactory().tz('America/New_York').year(year).month(month).date(day).hour(22).minute(0).second(0).millisecond(0).subtract(1, 'day')
        const now = dayjsFactory().tz('America/New_York')

        return now.isAfter(yesterday) && now.isBefore(today)
    }
}
export default plugin

declare module 'dayjs' {
    interface Dayjs {
        isTodaysContest(): boolean
    }
}
