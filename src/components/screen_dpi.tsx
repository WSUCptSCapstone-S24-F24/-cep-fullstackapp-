import React, { useState, useEffect } from 'react';
import { DPI } from '../types/interfaces' 

// Calculates screen DPI based off user input
function ScreenDPI({ setDPI }: DPI){
    const [diagonalSize, setDiagonalSize] = useState<number>(25);

    // Calculates the DPI of the monitor based on inputted diagonal monitor size in inches
    function calculateDPI(diagonalSizeInches: number): number {
        const diagonalSizePixels = Math.sqrt(screen.width ** 2 + screen.height ** 2);
        const dpi = diagonalSizePixels / diagonalSizeInches;
        console.log(`DPI: ${dpi}`);
        return dpi;
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
        </div>
    )
 }

 export default ScreenDPI;