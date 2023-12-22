'use client'
import * as React from 'react'
import { UserInfo } from "../lib/types";
import { Box, Subtitle } from "../ui/components";
import { createWorker, PSM } from 'tesseract.js'
import formStyles from '@/app/ui/form.module.css'
import { useFormState } from 'react-dom';
import { submitScore } from '../lib/actions';
import { Button } from '../ui/client-components';
import { currentPuzzleDate } from '../lib/util';
import { styleSheet } from '../ui/util';
import { Icon } from '../ui/common';

const loadWorker = createWorker('eng')

const timeRegex = /(\d{1,2}):(\d{2})/g
const timeRegexAlt = /(\d{1,2}).*seconds?/g

export default function Form({ userInfo }: { userInfo: UserInfo }) {
    const [file, setFile] = React.useState<File | null>(null)
    const [processing, setProcessing] = React.useState(false)

    const [error, setError] = React.useState('')
    const [minutes, setMinutes] = React.useState('00')
    const [seconds, setSeconds] = React.useState('00')

    const [date, setDate] = React.useState(currentPuzzleDate())

    const [state, formAction] = useFormState(submitScore, { message: '' })

    const fileSelectorRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        async function runOCR() {
            setProcessing(true)
            setMinutes('00')
            setSeconds('00')
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
                setMinutes('00')
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
        <Box>
            <p>Select a completion screenshot:</p>
            <Box row={true} gap="medium" style={{ alignItems: 'flex-end' }}>
                <Box style={styles.fileSelectContainer} className={formStyles.buttonActivity} onClick={() => fileSelectorRef.current?.click()}>
                    <input type="file" name="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} title='Select an image' style={styles.fileInput} ref={fileSelectorRef} />
                    <Icon name="imageUpload" width={64} height={64} />
                </Box>
                {processing && <p>Processing...</p>}
                {error && <Box className={formStyles.error}>{error}</Box>}
            </Box>
        </Box>
        <Box>
            <p>or enter your score manually:</p>
            <form action={formAction}>
                <Box gap="medium">
                    <Box style={{ alignItems: 'center' }}>
                        <p>Puzzle completed in</p>
                        <Box row={true} gap="none" style={styles.timeInputContainer}>
                            <input type="text" name="minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} style={styles.timeInput} size={2} />
                            <p style={styles.timeSeparator}>:</p>
                            <input type="text" name="seconds" value={seconds} onChange={(e) => setSeconds(e.target.value)} style={styles.timeInput} size={2} />
                        </Box>
                        <p>
                            Published on
                        </p>
                        <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} className={formStyles.textInput} />
                    </Box>
                    <Box>
                        <Box row={true}>
                            <input type="checkbox" name="submitAnother" id="submitAnother" value="false" />
                            <label htmlFor="submitAnother">submit another score</label>
                        </Box>
                        <Box>
                            <input type="hidden" name="userID" value={userInfo.id} />
                            <Button typeSubmit={true} disabled={minutes === '00' && seconds === '00'} label="Submit" pendingLabel='Submitting...' />
                            {state?.message && <Box className={formStyles.error}>{state.message}</Box>}
                        </Box>
                    </Box>
                </Box>
            </form>
        </Box>
    </Box>
}

const styles = styleSheet({
    fileInput: {
        display: 'none',
    },
    fileSelectContainer: {
        padding: '4px',
        border: '1px solid var(--color-tileBorder)',
        backgroundColor: 'var(--color-neutralButtonFill)',
        borderRadius: '2px',
        cursor: 'pointer',
        width: '72px'
    },
    timeInputContainer: {
        borderRadius: '0',
        border: '1px solid black',
        padding: '4px',
        maxWidth: '200px',
        backgroundColor: 'white',
        fontSize: '24px',
        alignItems: 'center',
    },
    timeInput: {
        fontSize: '24px',
        border: 'none',
        textAlign: 'center',
    },
    timeSeparator: {
        color: 'black',
    }
})