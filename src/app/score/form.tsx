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

const loadWorker = createWorker('eng')

const timeRegex = /(\d{1,2}):(\d{2})/g

export default function Form({ userInfo }: { userInfo: UserInfo }) {
    const [file, setFile] = React.useState<File | null>(null)
    const [processing, setProcessing] = React.useState(false)

    const [error, setError] = React.useState('')
    const [minutes, setMinutes] = React.useState('0')
    const [seconds, setSeconds] = React.useState('0')

    const dateStr = dayjs().format('YYYY-MM-DD')
    const [date, setDate] = React.useState(dateStr)

    const [state, formAction] = useFormState(submitScore, { message: '' })

    React.useEffect(() => {
        async function runOCR() {
            setProcessing(true)
            setMinutes('0')
            setSeconds('0')
            setError('')
            const worker = await loadWorker
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789:',
                tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
            })
            const { data: { text } } = await worker.recognize(file!)

            const matches = [...(text.matchAll(timeRegex))]
            let lastMatch = matches[matches.length - 1]
            if (lastMatch) {
                const [_, minutes, seconds] = lastMatch
                const parsedMinutes = parseInt(minutes)
                const parsedSeconds = parseInt(seconds)
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

    return <form action={formAction}>
        <Box gap="medium">
            <p>Select your completion screenshot</p>
            <Box row={true}>
                <input type="file" name="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} title='Upload' className={styles.fileInput} />
                {processing && <p>Processing...</p>}
                {error && <Box className={styles.error}>{error}</Box>}
            </Box>
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
        </Box>
    </form>
}