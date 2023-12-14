import * as React from 'react'

// this file is named icon-component because next.js reserves icon.tsx

type IconName = 'user' | 'key'

type Props = {
    name: IconName,
    width?: number,
    height?: number,
    stroke?: string,
    strokeWidth?: number,
    className?: string,
}
export default function Icon(props: Props) {
    const {
        name,
        width = 32,
        height = 32,
        stroke = 'var(--color-text)',
        strokeWidth = 1,
        className,
    } = props
    return <svg
        width={width}
        height={height}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={className}
        role="img">
        <use href={`/sprite.svg#${name}`} />
    </svg>
}