// src/hooks/useRefreshRate.ts
import { useEffect, useState } from "react";

const useRefreshRate = (duration = 3000) => {
    const [refreshRate, setRefreshRate] = useState<number | null>(null);
    const [maxRate, setMaxRate] = useState<number>(0);

    useEffect(() => {
        let start: number | null = null;
        let frameId: number | null = null;
        const rates: number[] = [];

        const measureRefreshRate = (timestamp: number) => {
            if (start === null) {
                start = timestamp;
            } else {
                const duration = timestamp - (start || 0);
                const rate = 1000 / duration;
                rates.push(Math.round(rate));
                setMaxRate((prevMax) => Math.max(prevMax, Math.round(rate)));
            }
            frameId = window.requestAnimationFrame(measureRefreshRate);
        };

        frameId = window.requestAnimationFrame(measureRefreshRate);

        const timeoutId = setTimeout(() => {
            // stop measuring after n seconds
            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }

            setRefreshRate(maxRate);
        }, duration);

        return () => {
            if (frameId) { 
                window.cancelAnimationFrame(frameId);
            }
            clearTimeout(timeoutId);
        };
    }, [maxRate, duration]);

    return { refreshRate, maxRate };
};

export default useRefreshRate
