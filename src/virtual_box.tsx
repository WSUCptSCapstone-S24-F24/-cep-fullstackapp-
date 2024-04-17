import React from 'react';
import {useRef, useEffect, useState} from 'react'

// Information on Virtual Box
interface VirtualBoxInfo {
    id: number;
    crosshairPosition: {x: number, y: number};
    name: string;
    height: string;
    width: string;
    top?: string;
    left?: string;
    right?: string;
    onHit: (id: number) => void;
}

const VirtualBox: React.FC<VirtualBoxInfo> = ({ id, crosshairPosition, name, height, width, top = '0', left = '0', right='0', onHit}) => {
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

        if (isInside)
        {
          onHit(id);
        }

        setIsInside(isInside);
    }, [crosshairPosition, isInside, onHit, id])

    return (
        <div
          ref={boxRef}
          style={{
            border: `2px solid ${isInside ? 'none' : 'none'}`, // Will change box color depending on if crosshair is inside the bounds of the box
            height: height,
            width: width,
            position: 'relative',
            top: top,
            left: left,
            right: right,
            zIndex: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            height: '20px',
            width: '20px',
            backgroundColor: 'red',
            borderRadius: '100%'
          }}/>
        </div>
    );
};

export default VirtualBox;