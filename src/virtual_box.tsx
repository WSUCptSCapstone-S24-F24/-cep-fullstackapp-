import React from 'react';
import {useRef, useEffect, useState} from 'react'

// Information on Virtual Box
interface VirtualBoxInfo {
    crosshairPosition: {x: number, y: number};
    name: string;
    height: string;
    width: string;
    top?: string;
    left?: string;
    right?: string;
}

const VirtualBox: React.FC<VirtualBoxInfo> = ({ crosshairPosition, name, height, width, top = '0', left = '0', right='0'}) => {
    const boxRef = useRef<HTMLDivElement>(null);

    const [isInside, setIsInside] = useState(false);

    useEffect(() =>{
        if (!boxRef.current) return;

        // Will check if the crosshair is within the bounds of the virtual box
        const box = boxRef.current.getBoundingClientRect();
        const isInside = 
        crosshairPosition.x >= box.left &&
        crosshairPosition.x <= box.right &&
        crosshairPosition.y >= box.top &&
        crosshairPosition.y <= box.bottom;

        setIsInside(isInside);
    }, [crosshairPosition])

    return (
        <div
          ref={boxRef}
          style={{
            border: `2px solid ${isInside ? 'red' : 'green'}`, // Will change box color depending on if crosshair is inside the bounds of the box
            height: height,
            width: width,
            position: 'relative',
            top: top,
            left: left,
            right: right,
            zIndex: 4
          }}
        >
        </div>
    );
};

export default VirtualBox;