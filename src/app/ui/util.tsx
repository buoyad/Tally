import * as React from 'react'

export function useMeasure() {
    const [dimensions, setDimensions] = React.useState<{ width: null, height: null, offsetLeft: null, offsetTop: null } |
    { width: number, height: number, offsetLeft: number, offsetTop: number }>({
        width: null,
        height: null,
        offsetLeft: null,
        offsetTop: null,
    });

    const previousObserver = React.useRef<ResizeObserver | null>(null);

    const customRef = React.useCallback((node: Element | null) => {
        if (previousObserver.current) {
            previousObserver.current.disconnect();
            previousObserver.current = null;
        }

        if (node?.nodeType === Node.ELEMENT_NODE) {
            const observer = new ResizeObserver(([entry]) => {
                if (entry && entry.borderBoxSize) {
                    const { inlineSize: width, blockSize: height } =
                        entry.borderBoxSize[0];

                    setDimensions({ width, height, offsetLeft: (entry.target as HTMLElement)?.offsetLeft, offsetTop: (entry.target as HTMLElement)?.offsetTop });
                }
            });

            observer.observe(node);
            previousObserver.current = observer;
        }
    }, []);

    return [customRef, dimensions] as const;
}

type StyleSheet = { [key: string]: React.CSSProperties }
export const styleSheet = <O extends StyleSheet>(styles: O) => styles