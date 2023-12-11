import { Box } from "./ui/components";

export default function Footer() {
    return <Box style={styles.container}>
        <span>created by <a href="https://ayoubd.com" style={styles.link} target="_blank">Danny Ayoub</a></span>
        <span><a href="https://github.com/buoyad/Tally" style={styles.link} target="_blank">source code</a></span>
    </Box>
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0 24px',
        fontSize: '12px',
        gap: '2px',
    },
    link: {
        color: 'var(--color-text)',
        fontWeight: 500,
    }
}