import { colors } from "./colors";

// referencing https://www.joshwcomeau.com/react/dark-mode/

const localStorageKey = 'color-mode'

function getInitialColorMode() {
    const persistedColorPreference = window.localStorage.getItem(localStorageKey);
    const hasPersistedPreference = typeof persistedColorPreference === 'string';
    // If the user has explicitly chosen light or dark,
    // let's use it. Otherwise, this value will be null.
    if (hasPersistedPreference) {
        return persistedColorPreference;
    }
    // If they haven't been explicit, let's check the media
    // query
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const hasMediaQueryPreference = typeof mql.matches === 'boolean';
    if (hasMediaQueryPreference) {
        return mql.matches ? 'dark' : 'light';
    }
    // If they are using a browser/OS that doesn't support
    // color themes, let's default to 'light'.
    return 'light';
}

const generateCSSVars = (light: boolean) => {
    return Object.entries(light ? colors.light : colors.dark).map(([key, value]) => {
        // @ts-ignore
        return `--color-${key}: ${value}`
    })
}

export const SetInitialColors = () => {
    let codeToRunOnClient = `
    (function() {
        function getInitialColorMode() {
            const persistedColorPreference = window.localStorage.getItem('${localStorageKey}');
            const hasPersistedPreference = typeof persistedColorPreference === 'string';
            // If the user has explicitly chosen light or dark,
            // let's use it. Otherwise, this value will be null.
            if (hasPersistedPreference) {
                return persistedColorPreference;
            }
            // If they haven't been explicit, let's check the media
            // query
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            const hasMediaQueryPreference = typeof mql.matches === 'boolean';
            if (hasMediaQueryPreference) {
                return mql.matches ? 'dark' : 'light';
            }
            // If they are using a browser/OS that doesn't support
            // color themes, let's default to 'light'.
            return 'light';
        }

        const colorMode = getInitialColorMode();

        // const root = document.documentElement;

        const head = document.head || document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.type = 'text/css';
        const cssLight = ':root { --initial-color-mode: ' + colorMode + ';' + '${generateCSSVars(true).join('; ')}' + '}';
        const cssDark =  ':root { --initial-color-mode: ' + colorMode + ';' + '${generateCSSVars(false).join('; ')}' + '}';
        style.appendChild(document.createTextNode(colorMode === 'light' ? cssLight : cssDark));
        head.appendChild(style);
    })()
    `

    return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />
}