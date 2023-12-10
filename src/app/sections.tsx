import React from "react"
import { getGlobalTopPerformers, getLongestStreaks } from "./lib/db"
import { PuzzleType } from "./lib/types"
import { Box, Ordinal, Subheading, TimeScore } from "./ui/components"

export const GlobalTopPerformers = async () => {
    const globalTopPerformers = await getGlobalTopPerformers(PuzzleType.mini)
    return <Box style={styles.gridContainer}>
        <p />
        <Subheading>Name</Subheading>
        <Subheading>Avg. score</Subheading>
        {globalTopPerformers.map((p, i) => {
            return <React.Fragment key={p.user_name}>
                <strong><Ordinal position={i + 1} /></strong>
                <p>{p.user_name}</p>
                <TimeScore score={p.avg_score} />
            </React.Fragment>
        })}
    </Box>
}

export const GlobalTopPerformersLoading = () => {
    return <Box style={{ ...styles.gridContainer, ...styles.loading }}>
        <p />
        <Subheading>Name</Subheading>
        <Subheading>Avg. score</Subheading>
        {[1, 2, 3].map((pos) => (
            <React.Fragment key={pos}>
                <strong><Ordinal position={pos} /></strong>
                <p>Loading...</p>
                <p>0:00</p>
            </React.Fragment>
        ))}
    </Box>
}

export const GlobalTopStreaks = async () => {
    const globalTopStreaks = await getLongestStreaks(PuzzleType.mini)
    return <Box style={styles.gridContainer}>
        <p />
        <Subheading>Name</Subheading>
        <Subheading>Streak</Subheading>
        {globalTopStreaks.map((p, i) => {
            return <React.Fragment key={p.user_name}>
                <strong><Ordinal position={i + 1} /></strong>
                <p>{p.user_name}</p>
                <p>{p.length} {p.length === 1 ? 'day' : 'days'}</p>
            </React.Fragment>
        })}
    </Box>
}

export const GlobalTopStreaksLoading = () => {
    return <Box style={{ ...styles.gridContainer, ...styles.loading }}>
        <p />
        <Subheading>Name</Subheading>
        <Subheading>Streak</Subheading>
        {[1, 2, 3].map((pos) => (
            <React.Fragment key={pos}>
                <strong><Ordinal position={pos} /></strong>
                <p>Loading...</p>
                <p>0 days</p>
            </React.Fragment>
        ))}
    </Box>
}

const styles: { [key: string]: React.CSSProperties } = {
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '.25fr 1fr .5fr',
        gap: '1rem',
        width: '100%'
    },
    fullWidth: {
        gridColumn: '1 / -1'
    },
    loading: {
        opacity: 0.5
    }
}