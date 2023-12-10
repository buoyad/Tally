'use client'
import * as React from 'react'
import { animated, useSpring, useSprings } from "@react-spring/web"
import { Score, UserInfo } from "../lib/types"
import { Box, TimeScore } from '../ui/components'
import Link from 'next/link'
import { timeScoreLargeFont } from '../ui/client-components'

const podiumColors = ['#4d88f9', '#d7d7d7', '#824a02']

type PodiumProps = {
    scores: (Score & { user_name: string })[],
}
export function Podium({ scores }: PodiumProps) {
    let placers = scores.slice(0, 3)

    const [platformTrails] = useSprings(
        3,
        (idx) => ({
            from: {
                height: '0px',
                backgroundColor: 'transparent',
                boxShadow: '0px 0px transparent',
                border: '0px solid transparent'
            },
            to: {
                height: `${45 + ((2 - idx) * 50)}px`,
                backgroundColor: podiumColors[idx],
                boxShadow: '5px 5px black',
                border: '2px solid black',
            },
            delay: idx * 100, // useTrail did not work, every animation landed on the value returned for idx 0.
        })
    )

    const [placerTrails] = useSprings(
        3,
        (idx) => ({
            from: {
                opacity: 0,
                transform: 'scale(0)',
            },
            to: {
                opacity: 1,
                transform: 'scale(1)',
            },
            config: {
                mass: 1,
                tension: 300,
                friction: 20,
            },
            delay: idx * 200 + 200
        })
    )

    return <div style={styles.podiumContainer}>
        <div style={styles.podiumBase}>
            <AnimatedPlacer username={placers[1]?.user_name} score={placers[1]?.score} pos={1} style={placerTrails[1]} />
            <animated.div style={{ ...styles.podium, ...platformTrails[1], borderTopRightRadius: 0 }} />
        </div>
        <div style={styles.podiumBase}>
            <AnimatedPlacer username={placers[0]?.user_name} score={placers[0]?.score} pos={0} style={placerTrails[0]} />
            <animated.div style={{ ...styles.podium, ...platformTrails[0] }} />
        </div>
        <div style={styles.podiumBase}>
            <AnimatedPlacer username={placers[2]?.user_name} score={placers[2]?.score} pos={2} style={placerTrails[2]} />
            <animated.div style={{ ...styles.podium, ...platformTrails[2], borderTopLeftRadius: 0 }} />
        </div>
    </div>
}

const placerIcons = ['👑', '🥈', '🥉']

const Placer = ({ username, score, pos, style }: { username: string, score: number, pos: number, style?: React.CSSProperties }) => {
    return <Box style={{ ...styles.placerContainer, top: pos * 50, ...style }}>
        <p style={styles.placerIcon}>{placerIcons[pos]}</p>
        <p style={styles.placerName}>{username || <Link href='/score'>You?</Link>}</p>
        {score && <TimeScore score={score} style={styles.placerScore} />}
    </Box>
}

const AnimatedPlacer = animated(Placer)

export const AnimatedCounter = ({ value }: { value: number }) => {
    const { number, opacity } = useSpring({
        from: { opacity: .5, number: 0 },
        number: value,
        opacity: 1,
        delay: 100,
        config: {
            round: 1,
            mass: 100,
            tension: 100,
            friction: 60,
            duration: Math.log2(value) * 200,
        }
    });
    return <animated.p className={timeScoreLargeFont.className} style={{ fontSize: '64px', opacity }}>{number}</animated.p>
}

const styles: { [key: string]: React.CSSProperties } = {
    podiumContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        width: '100%',
        justifyItems: 'center',
        paddingBottom: '20px',
    },
    podiumBase: {
        height: '300px',
        width: '100%',
        position: 'relative',
        minWidth: 0,
    },
    podium: {
        position: 'absolute',
        bottom: '5px',
        width: '95%',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px'
    },
    placerContainer: { alignItems: 'center', height: '150px', width: '100%', whiteSpace: 'nowrap', position: 'relative' },
    placerIcon: {
        fontSize: '40px',
    },
    placerName: {
        fontWeight: 'bold',
        fontSize: '20px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: '100%',
        textAlign: 'center',
    },
    placerScore: {
        fontSize: '20px',
    }
}