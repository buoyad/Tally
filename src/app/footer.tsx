import { Box } from "./ui/components";
import { ColorMode } from "./ui/theme-context";
import { styleSheet } from "./ui/util";

export default function Footer() {
    return <Box style={styles.container}>
        <span>created by <a href="https://ayoubd.com" style={styles.link} target="_blank">Danny Ayoub</a></span>
        <ColorMode />
        <span><a href="https://github.com/buoyad/Tally" style={styles.link} target="_blank">source code</a></span>
    </Box>
}

const styles = styleSheet({
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
})