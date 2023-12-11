'use client'
import React from "react"
import { getPreference, setPreference } from "./dark-mode"
import { colors } from "./colors"

export type Theme = 'light' | 'dark'

export const ThemeContext = React.createContext({ colorMode: 'light', setColorMode: (colorMode: Theme) => { } })

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [colorMode, rawSetColorMode] = React.useState<Theme>('light')

    React.useEffect(() => {
        const root = window.document.documentElement
        const initialColorValue = root.style.getPropertyValue('--initial-color-mode')
        rawSetColorMode(initialColorValue === 'light' ? 'light' : 'dark')
    }, [])

    const listener = (e: MediaQueryListEvent) => {
        const preference = getPreference()
        if (!preference) {
            setColorMode(e.matches ? 'dark' : 'light', false)
        }
    }

    React.useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener)
        return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener)
    })

    const setColorMode = (newValue: 'light' | 'dark', savePreference: boolean = true) => {
        const root = window.document.documentElement
        rawSetColorMode(newValue)
        savePreference && setPreference(newValue)

        const c = newValue === 'light' ? colors.light : colors.dark
        Object.entries(c).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value)
        })
    }

    return (
        <ThemeContext.Provider value={{ colorMode, setColorMode }}>
            {children}
        </ThemeContext.Provider>
    )
}