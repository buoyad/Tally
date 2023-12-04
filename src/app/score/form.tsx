'use client'
import * as React from 'react'
import { UserInfo } from "../lib/db";
import { Box } from "../ui/components";
import { createWorker, PSM } from 'tesseract.js'

const loadWorker = createWorker('eng')

export default function Form({ userInfo }: { userInfo: UserInfo }) {
    const [file, setFile] = React.useState<File | null>(null)
    const [processing, setProcessing] = React.useState(false)
    const [parsedTime, setParsedTime] = React.useState('')

    React.useEffect(() => {
        async function runOCR() {
            setProcessing(true)
            const worker = await loadWorker
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789:',
                tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
            })
            const { data: { text } } = await worker.recognize(file!)
            setParsedTime(text)
            await worker.terminate()
            setProcessing(false)
        }
        if (file) {
            runOCR()
        }
    }, [file])

    return <form>
        <Box>
            <input type="file" name="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
            {processing && <p>Processing...</p>}
            {parsedTime && <p>{parsedTime}</p>}
        </Box>
    </form>
}