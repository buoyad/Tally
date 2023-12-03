import { GridBox } from "./ui/components";

export default function Footer() {
    return <GridBox style={styles.container}>
        <span>created by <a href="https://ayoubd.com" target="_blank">Danny Ayoub</a></span>
    </GridBox>
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        placeContent: 'center center',
        padding: '12px 0',
        boxShadow: '0 -1px 2px -2px black',
        fontSize: '12px',
    }
}