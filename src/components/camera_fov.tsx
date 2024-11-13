import React, { useState } from 'react';
import { FOV } from '../types/interfaces' 

function CameraFOV({ setFOV } : FOV){
    const [inputFOV, setInputFOV] = useState<number>(55);

    const handleSetFOV = () => {
        setFOV(inputFOV);
    }

    // Sets new diagonal size when user input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputFOV(parseFloat(event.target.value));
    };

    return (
        <div>
            <button onClick={handleSetFOV}>
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