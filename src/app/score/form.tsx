'use client'
import * as React from 'react'
import { UserInfo } from "../lib/types";
import { Box } from "../ui/components";
import { createWorker, PSM } from 'tesseract.js'
import styles from '@/app/ui/form.module.css'
import { useFormState } from 'react-dom';
import { submitScore } from '../lib/actions';
import { Button } from '../ui/client-components';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const loadWorker = createWorker('eng')

const timeRegex = /(\d{1,2}):(\d{2})/g
const timeRegexAlt = /(\d{1,2}).*seconds?/g

const getDefaultDay = () => {
    const timeInNY = dayjs().tz('America/New_York')
    let currentlyPublishedDay = timeInNY.format('YYYY-MM-DD')
    if (timeInNY.hour() >= 22) {
        currentlyPublishedDay = timeInNY.add(1, 'day').format('YYYY-MM-DD')
    }
    return currentlyPublishedDay
}

export default function Form({ userInfo }: { userInfo: UserInfo }) {
    const [file, setFile] = React.useState<File | null>(null)
    const [processing, setProcessing] = React.useState(false)

    const [error, setError] = React.useState('')
    const [minutes, setMinutes] = React.useState('0')
    const [seconds, setSeconds] = React.useState('0')

    const [date, setDate] = React.useState(getDefaultDay())

    const [state, formAction] = useFormState(submitScore, { message: '' })

    React.useEffect(() => {
        async function runOCR() {
            setProcessing(true)
            setMinutes('0')
            setSeconds('0')
            setError('')
            const worker = await loadWorker
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789:seconds',
                tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
            })
            const { data: { text } } = await worker.recognize(file!)

            const matches = [...(text.matchAll(timeRegex))]
            let lastMatch = matches[matches.length - 1]
            let matchesAlt = [...text.matchAll(timeRegexAlt)]
            let lastMatchAlt = matchesAlt[matchesAlt.length - 1]
            if (lastMatchAlt) {
                const [_, seconds] = lastMatchAlt
                setMinutes('0')
                setSeconds(seconds)
            } else if (lastMatch) {
                const [_, minutes, seconds] = lastMatch
                setMinutes(minutes)
                setSeconds(seconds)
                setError('')
            } else {
                setError('unable to read time, try again or enter manually')
            }
            setProcessing(false)
        }
        if (file && file.type.startsWith('image/')) {
            runOCR()
        }
    }, [file])

    return <Box gap="medium">
        <p>Select your completion screenshot</p>
        <Box row={true}>
            <input type="file" name="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} title='Upload' className={styles.fileInput} />
            {processing && <p>Processing...</p>}
            {error && <Box className={styles.error}>{error}</Box>}
        </Box>
        <form action={formAction}>
            <p>
                Puzzle completed in{' '}
                <input type="text" name="minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={styles.textInput} size={2} />{' '}
                {minutes === '1' ? 'minute' : 'minutes'} and{' '}
                <input type="text" name="seconds" value={seconds} onChange={(e) => setSeconds(e.target.value)} className={styles.textInput} size={2} />{' '}
                {seconds === '1' ? 'second' : 'seconds'}. Puzzle published on{' '}
                <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.textInput} />
            </p>
            <Box row={true}>
                <input type="checkbox" name="submitAnother" id="submitAnother" value="false" />
                <label htmlFor="submitAnother">submit another score</label>
            </Box>
            <input type="hidden" name="userID" value={userInfo.id} />
            <Button typeSubmit={true} label="Submit" pendingLabel='Submitting...' />
            {state?.message && <Box className={styles.error}>{state.message}</Box>}
        </form>
    </Box>
}