'use client'
import * as React from 'react'
import { UserInfo } from "../lib/db";
import { Box } from "../ui/components";
import { createWorker, PSM } from 'tesseract.js'
import styles from '@/app/ui/form.module.css'

const loadWorker = createWorker('eng')

const timeRegex = /(\d{1,2}):(\d{2})/g

export default function Form({ userInfo }: { userInfo: UserInfo }) {
    const [file, setFile] = React.useState<File | null>(null)
    const [processing, setProcessing] = React.useState(false)
    const [parsedTime, setParsedTime] = React.useState(-1)

    React.useEffect(() => {
        async function runOCR() {
            setProcessing(true)
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
                const totalSeconds = parsedMinutes * 60 + parsedSeconds
                setParsedTime(totalSeconds)
            }

            setProcessing(false)
        }
        if (file && file.type.startsWith('image/')) {
            runOCR()
        }
    }, [file])

    return <form>
        <Box>
            <p>Select your completion screenshot</p>
            <input type="file" name="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} title='Upload' className={styles.fileInput} />
            {processing && <p>Processing...</p>}
            {parsedTime > 0 && <p>{Math.floor(parsedTime / 60)} minutes and {Math.floor(parsedTime % 60)} seconds</p>}
        </Box>
    </form>
}