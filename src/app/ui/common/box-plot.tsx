'use client'
import React from 'react'
import { scaleLinear } from '@visx/scale'
import { ParentSize } from '@visx/responsive'
import { Group } from "@visx/group"
import { BoxPlot } from '@visx/stats'
import { AnimatedAxis } from '@visx/react-spring'
import { Baloo_2 } from "next/font/google"
import { displaySeconds } from "@/app/lib/util"
import { styleSheet, useMeasure } from '../util'
import { Score } from "@/app/lib/types"
import { Info } from 'react-feather'
import { Box, TimeScore } from '../components'
import { animated, useSpring } from '@react-spring/web'

const timeScoreFont = Baloo_2({ subsets: ['latin'], weight: '500' })

const getScoreStats = (scores: Score[]) => {
    const sortedScores = scores.sort((a, b) => a.score - b.score)
    const median = sortedScores[Math.floor((sortedScores.length) / 2)].score
    const firstQuartile = sortedScores[Math.floor((sortedScores.length) / 4)].score
    const thirdQuartile = sortedScores[Math.floor((sortedScores.length) * 3 / 4)].score
    const iqr = thirdQuartile - firstQuartile
    let outliers: Score[] = []
    const filteredScores = sortedScores.filter(score => {
        if (score.score > thirdQuartile + (1.5 * iqr)) {
            outliers.push(score)
            return false
        }
        if (score.score < firstQuartile - (1.5 * iqr)) {
            outliers.push(score)
            return false
        }
        return true
    })
    return {
        median,
        firstQuartile,
        thirdQuartile,
        filteredScores,
        min: sortedScores[0].score,
        max: sortedScores[sortedScores.length - 1].score,
        minNoOutliers: filteredScores[0].score,
        maxNoOutliers: filteredScores[filteredScores.length - 1].score,
        outliers,
    }
}


type Props = {
    scores: Score[],
    parentWidth: number,
    parentHeight: number,
}
function _ScoreBoxPlot({ scores, parentWidth, parentHeight }: Props) {
    const stats = getScoreStats(scores)

    const [infoOpen, setInfoOpen] = React.useState(false)
    const [ref, tooltipSize] = useMeasure()
    const infoSpring = useSpring({
        height: 0,
        boxShadow: '0px 0px transparent',
        border: '0px solid transparent',
        to: {
            height: infoOpen ? tooltipSize.height : 0,
            boxShadow: infoOpen ? '2px 2px var(--color-boxShadow)' : '0px 0px transparent',
            border: infoOpen ? '1px solid var(--color-boxShadow)' : '0px solid transparent',
        }
    })

    const margin = {
        top: 12, right: 12, bottom: 40, left: 12,
    }

    const height = 125

    const innerWidth = parentWidth - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const scale = scaleLinear({
        domain: [stats.min, stats.max],
        range: [0, innerWidth],
    })

    if (parentWidth === 0) {
        return <div style={{ height }} />
    }

    return <div style={styles.container}>
        <div style={styles.infoIcon} onClick={() => setInfoOpen(!infoOpen)}>
            <p><Info size="1em" /></p>
        </div>
        <svg width={parentWidth} height={height}>
            <Group left={margin.left} top={margin.top}>
                <BoxPlot
                    valueScale={scale}
                    horizontal={true}
                    min={stats.minNoOutliers}
                    firstQuartile={stats.firstQuartile}
                    median={stats.median}
                    thirdQuartile={stats.thirdQuartile}
                    max={stats.maxNoOutliers}
                    medianProps={{ strokeWidth: 2 }}
                    fill="var(--color-boxPlotFill)"
                    stroke="var(--color-boxPlotStroke)"
                    strokeWidth={1}
                    boxWidth={innerHeight * .7}
                    top={innerHeight * .15}
                    outliers={stats.outliers.map(s => s.score)} />
                <AnimatedAxis
                    scale={scale}
                    top={innerHeight}
                    tickValues={[stats.min, stats.firstQuartile, stats.thirdQuartile, stats.max]}
                    tickFormat={v => displaySeconds(v.valueOf())}
                    stroke={'var(--color-text)'}
                    tickStroke={'var(--color-text)'}
                    tickLabelProps={{ fill: 'var(--color-text)', fontFamily: timeScoreFont.style.fontFamily, fontSize: 12, transform: 'rotate(45, -5, -5)' }} />
            </Group>
        </svg>
        <animated.div style={{
            top: height,
            ...styles.infoContainer,
            ...infoSpring,
        }}>
            <div ref={ref} style={styles.infoInner}>
                <Box style={styles.infoLayout}>
                    <p>minimum</p>
                    <p><TimeScore score={stats.min} /></p>
                    <p>25% of scores below</p>
                    <p><TimeScore score={stats.firstQuartile} /></p>
                    <p>median</p>
                    <p><TimeScore score={stats.median} /></p>
                    <p>75% of scores below</p>
                    <p><TimeScore score={stats.thirdQuartile} /></p>
                    <p>maximum</p>
                    <p><TimeScore score={stats.max} /></p>
                    <p>outliers</p>
                    <p>{stats.outliers.length}</p>
                </Box>
            </div>
        </animated.div>
    </div>
}

const styles = styleSheet({
    container: { position: 'relative' },
    infoIcon: { position: 'absolute', top: '4px', right: '4px', cursor: 'pointer' },
    infoContainer: {
        position: 'absolute',
        background: 'var(--color-background)',
        left: 0,
        zIndex: 1,
        overflow: 'hidden',
        width: '100%',
    },
    infoInner: {
        fontSize: '14px',
        lineHeight: '.8rem',
        padding: '0.5rem 0.5rem',
    },
    infoLayout: { display: 'grid', gridTemplateColumns: '.7fr .25fr 1fr .25fr', gap: '.5rem', width: '100%' }
})

type ExternalProps = {
    scores: Score[],
}
export default function ScoreBoxPlot(props: ExternalProps) {
    return <ParentSize>
        {({ width, height }) => <_ScoreBoxPlot {...props} parentWidth={width} parentHeight={height} />}
    </ParentSize>
}