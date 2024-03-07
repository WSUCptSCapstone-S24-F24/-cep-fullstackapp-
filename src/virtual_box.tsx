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
    const centerDotRef = useRef<HTMLDivElement>(null);

    const [isInside, setIsInside] = useState(false);
    const [distance, updateDistance] = useState<number>(0);

    useEffect(() =>{
        if (!boxRef.current || !centerDotRef.current) return;

        // Will check if the crosshair is within the bounds of the virtual box
        const box = boxRef.current.getBoundingClientRect();
        const dot = centerDotRef.current.getBoundingClientRect();
        const isInside = 
        crosshairPosition.x >= box.left &&
        crosshairPosition.x <= box.right &&
        crosshairPosition.y >= box.top &&
        crosshairPosition.y <= box.bottom;

        setIsInside(isInside);

        if (!centerDotRef.current) return;
        

        // Will calculate the center position of the dot
        const dotCenterX = dot.left + (dot.width) / 2;
        const dotCenterY = dot.top + (dot.height) / 2;

        // Calculate the distance between center dot and crosshair position
        const distance = Math.sqrt(Math.pow(crosshairPosition.x - dotCenterX, 2) + Math.pow(crosshairPosition.y - dotCenterY, 2));

        // Update Variables
        updateDistance(distance);
        

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
            <div
                ref={centerDotRef}
                style={{
                height: '10px',
                width: '10px',
                backgroundColor: 'blue',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'scale(1.3) translate(-50%, -50%)', // Centers the dot
                }}
            />
            {/*Dispay distance crosshair is from center point*/}
            <span style={{ position: 'absolute', bottom: '10px', color: 'black', fontWeight: 'bold', visibility: `${isInside ? 'visible' : 'hidden'}`}}>
                {name + " accuracy: " + distance.toFixed(2) + " px"}
            </span>
        </div>
    );
};

export default VirtualBox;