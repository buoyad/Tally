'use client'
import React from 'react'
import { scaleLinear } from '@visx/scale'
import { ParentSize } from '@visx/responsive'
import { Group } from "@visx/group"
import { BoxPlot } from '@visx/stats'
import { Baloo_2 } from "next/font/google"
import { displaySeconds } from "@/app/lib/util"
import { styleSheet, useMeasure } from '../util'
import { LegendOrdinal } from '@visx/legend'
import { XYChart, AnimatedLineSeries, AnimatedAxis, AnimatedGrid, DataProvider, DataContext, buildChartTheme } from '@visx/xychart'
import dayjs from 'dayjs'

const displayDate = (date: string) => dayjs(date).format('MMM D')

const textFont = Baloo_2({ subsets: ['latin'], weight: '500' })

const reduceData = (avgs: Props['avgs']) => {
    let earliestDay = dayjs(avgs[0].for_day)
    for (let i = 0; i < avgs.length; i++) {
        if (dayjs(avgs[i].for_day).isBefore(earliestDay)) {
            earliestDay = dayjs(avgs[i].for_day)
        }
    }
    return avgs.reduce((res, avg, idx) => {
        res[avg.name] = res[avg.name] || []
        res[avg.name].push({ x: avg.for_day, y: parseFloat(avg.moving_avg) })
        return res
    }, {} as { [key: string]: { x: string, y: number | null }[] })
}

const accessors = {
    xAccessor: (d: { x: string, y: number | null }) => d.x,
    yAccessor: (d: { x: string, y: number | null }) => d.y,
}

type Props = ExternalProps & {
    parentWidth: number,
    parentHeight: number,
}
function _MovingAvgLineGraph({ avgs, parentWidth, parentHeight }: Props) {
    const data = reduceData(avgs)
    if (Object.keys(data).length === 0) {
        return null
    }

    const margin = {
        top: 12, right: 12, bottom: 40, left: 12,
    }

    const height = 125

    const innerWidth = parentWidth - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    if (parentWidth === 0) {
        return <div style={{ height }} />
    }

    const theme = buildChartTheme({
        backgroundColor: 'var(--color-background)',
        colors: ['#18B15C', '#2C8ADB', '#DBC11B', '#DB3041', '#53E176', '#6DCDFF', '#FFED5C', '#FF7B71'],
        gridColor: 'rgba(0, 0, 0, .1)',
        gridColorDark: 'rgba(0, 0, 0, .1)',
        tickLength: 4
    })

    return <DataProvider xScale={{ type: 'band' }} yScale={{ type: 'linear' }} theme={theme}>
        <PlotLegend />
        <XYChart height={300} width={parentWidth} margin={{ left: 36, right: 8, top: 24, bottom: 24 }}>
            {Object.entries(data).map(([name, data]) =>
                <AnimatedLineSeries key={name} dataKey={name} data={data} {...accessors} />
            )}
            <AnimatedAxis orientation="bottom" tickFormat={(val) => displayDate(val)} strokeWidth={1} numTicks={6} tickLabelProps={{ className: textFont.className }} />
            <AnimatedAxis orientation="left" tickFormat={(val) => displaySeconds(val)} strokeWidth={1} tickLabelProps={{ className: textFont.className }} />
            <AnimatedGrid numTicks={15} strokeDasharray='10,5' />
        </XYChart>
    </DataProvider>
}

const PlotLegend = () => {
    const { colorScale, theme, margin } = React.useContext(DataContext)

    return <LegendOrdinal
        direction="row"
        itemMargin="8px 8px 8px 0"
        scale={colorScale!}
        labelFormat={(label) => label.replace("-", " ")}
        legendLabelProps={{ color: "black" }}
        shape="line"
        className={textFont.className}
        style={{
            backgroundColor: theme?.backgroundColor,
            paddingLeft: margin?.left,
            marginBottom: -28,
            color: 'black',
            display: 'flex', // required in addition to `direction` if overriding styles
        }}
    />

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
    avgs: { user_id: number, name: string, for_day: string, moving_avg: string }[]
}
export default function MovingAvgLineGraph(props: ExternalProps) {
    return <ParentSize>
        {({ width, height }) => <_MovingAvgLineGraph {...props} parentWidth={width} parentHeight={height} />}
    </ParentSize>
}