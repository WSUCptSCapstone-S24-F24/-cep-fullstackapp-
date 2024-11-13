import React, { useState } from 'react';
import { FocalLength } from '../types/interfaces' 

function CameraFOV({ setFocalLength } : FocalLength){
    const [inputFOV, setInputFOV] = useState<number>(55);

    const handleSetFocalLength = () => {
        const calculatedFocalLength = screen.width / (2 * Math.tan((inputFOV / 2.0) * Math.PI / 180.0));
        setFocalLength(calculatedFocalLength);  // Set the calculated focal length
    };

    // Sets new diagonal size when user input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputFOV(parseFloat(event.target.value));
    };

    return (
        <div>
            <button onClick={handleSetFocalLength}>
                Set camera FOV
            </button>
            <input
                type="number"
                value={inputFOV}
                onChange={handleInputChange}
            />
        </div>
    )
}

export default CameraFOV;