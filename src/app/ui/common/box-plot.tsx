'use client'
import React from 'react'
import { scaleLinear } from '@visx/scale'
import { ParentSize } from '@visx/responsive'
import { Group } from "@visx/group"
import { BoxPlot } from '@visx/stats'
import { AnimatedAxis } from '@visx/react-spring'
import { Annotation, HtmlLabel, Connector, LineSubject } from '@visx/annotation'
import { Baloo_2 } from "next/font/google"
import { displaySeconds } from "@/app/lib/util"
import { Score } from "@/app/lib/types"

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

    const [showHelp, setShowHelp] = React.useState(true)


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

    return <div style={{ position: 'relative' }}>
        <svg width={parentWidth} height={height} style={{ overflow: 'visible' }}>
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
                    tickLabelProps={{ fill: 'var(--color-text)', fontFamily: timeScoreFont.style.fontFamily, fontSize: 12 }} />
            </Group>
        </svg>
    </div>
}

type ExternalProps = {
    scores: Score[],
}
export default function ScoreBoxPlot(props: ExternalProps) {
    return <ParentSize>
        {({ width, height }) => <_ScoreBoxPlot {...props} parentWidth={width} parentHeight={height} />}
    </ParentSize>
}