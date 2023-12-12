'use client'
import React from "react"
import { getThemePreference, setThemePreference } from "./dark-mode"
import { colors } from "./colors"
import { Box } from "./components"
import { animated, useSpring } from "@react-spring/web"
import { styleSheet, useMeasure } from "./util"

export type Theme = 'light' | 'dark'

const ThemeContext = React.createContext<{
    theme: Theme | undefined,
    preference: Theme | undefined,
    setTheme: (theme: Theme | undefined) => void
}>({ theme: undefined, preference: undefined, setTheme: (colorMode) => { } })

export const useTheme = () => React.useContext(ThemeContext)

const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, rawSetTheme] = React.useState<Theme | undefined>(undefined)
    const [preference, setPreference] = React.useState<Theme | undefined>(undefined)

    React.useEffect(() => {
        const root = window.document.documentElement
        const initialMode = getComputedStyle(root).getPropertyValue('--initial-color-mode')
        // initialMode should always be light or dark, using the preference if saved or the system default.
        rawSetTheme(initialMode === 'light' ? 'light' : 'dark')
        // getThemePreference may return return light or dark if one has been set, or undefined if system default.
        setPreference(getThemePreference())
    }, [])

    React.useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)')
        mql.onchange = (e) => {
            if (preference === undefined) {
                setTheme(e.matches ? 'dark' : 'light', false)
            }
        }
        return () => { mql.onchange = null }
    })

    const setTheme = (newValue: 'light' | 'dark' | undefined, savePreference: boolean = true) => {
        const newTheme = newValue ?? getSystemTheme()
        rawSetTheme(newTheme)
        savePreference && setPreference(newValue)
        savePreference && setThemePreference(newValue)

        const root = window.document.documentElement
        const c = newTheme === 'light' ? colors.light : colors.dark
        Object.entries(c).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value)
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, preference, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const ColorMode = () => {
    const { theme, preference, setTheme } = useTheme()

    const [rLight, dimLight] = useMeasure()
    const [rDark, dimDark] = useMeasure()
    const [rSys, dimSys] = useMeasure()


    const [spring, api] = useSpring(() => ({
        immediate: true,
        height: 0,
        width: 0,
        left: 0,
    }))


    const prevTheme = React.useRef<Theme | undefined>(theme)
    React.useLayoutEffect(() => {
        if (theme) {
            const firstRender = prevTheme.current === undefined && !!theme
            let target
            switch (preference) {
                case 'light': {
                    target = dimLight
                    break;
                }
                case 'dark': {
                    target = dimDark
                    break;
                }
                default: {
                    target = dimSys
                    break;
                }
            }
            api.start({
                height: (target.height ?? 0) + 4,
                width: (target.width ?? 0) + 4,
                left: (target.offsetLeft ?? 0) - 2,
                immediate: firstRender,
            })

            prevTheme.current = theme
        }
    }, [theme, preference, dimLight, dimDark, dimSys, api])

    return <Box row={true} style={styles.colorModeContainer}>
        <AnimatedBox row={true} style={{ ...styles.colorModeIndicator, ...spring }} />
        <label title="light mode" ref={rLight} onClick={() => setTheme('light')} style={styles.label}>🔆</label>
        <label title="dark mode" ref={rDark} onClick={() => setTheme('dark')} style={styles.label}>🌚</label>
        <label title="follow system preference" ref={rSys} onClick={() => setTheme(undefined)} style={styles.label}>🖥️</label>
    </Box>
}

const AnimatedBox = animated(Box)

const styles = styleSheet({
    colorModeContainer: {
        background: 'var(--color-selectBackground)',
        padding: '6px',
        borderRadius: '2px',
        position: 'relative',
        zIndex: 0,
    },
    colorModeIndicator: {
        background: 'var(--color-selectIndicator)',
        borderRadius: '2px',
        position: 'absolute',
        zIndex: 1,
    },
    label: {
        cursor: 'pointer',
        zIndex: 2,
        padding: '0px 2px',
        fontSize: '1.2em',
        transform: 'translateY(-1px)'
    }
})
