import { Box, LoadingIndicator } from "../ui/components"

export default function Loading() {
    return <main>
        <Box style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <LoadingIndicator size="large" />
        </Box>
    </main>
}