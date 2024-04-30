// screen_dpi.tsx
import React, { useState } from 'react';

// Calculates screen DPI based off user input
const ScreenDPI: React.FC<{dpi: number, setDPI: (dpi: number) => void}> = ({ dpi, setDPI }) => {
    const [diagonalSize, setDiagonalSize] = useState<number>(25);

    // Calculates the DPI of the monitor based on inputted diagonal monitor size in inches
    function calculateDPI(diagonalSizeInches: number): number {
        const diagonalSizePixels = Math.sqrt(screen.width ** 2 + screen.height ** 2);
        return diagonalSizePixels / diagonalSizeInches;
    }

    // Sets new dpi when diagonal size changes
    const handleSetDiagonal = () => {
        const newDPI = calculateDPI(diagonalSize);
        setDPI(newDPI);
    };

    // Sets new diagonal size when user input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDiagonalSize(parseFloat(event.target.value));
    };

    return (
        <div>
            <button onClick={handleSetDiagonal}>
                Set screen diagonal length (inches)
            </button>
            <input
                type="number"
                value={diagonalSize}
                onChange={handleInputChange}
            />
            <div> Current DPI: {dpi}</div>
        </div>
    )
 }

 export default ScreenDPI;