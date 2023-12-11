import { Box } from "./ui/components";

export default function Footer() {
    return <Box style={styles.container}>
        <span>created by <a href="https://ayoubd.com" target="_blank">Danny Ayoub</a></span>
        <span><a href="https://github.com/buoyad/Tally" target="_blank">source code</a></span>
    </Box>
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 0',
        boxShadow: '0 -1px 2px -2px var(--color-text)',
        fontSize: '12px',
        gap: '2px',
    }
}