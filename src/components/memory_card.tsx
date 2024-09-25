import React from 'react';
import {useRef, useEffect, useState} from 'react'
import { VirtualBoxInfo } from '../types/interfaces';

const MemoryCard: React.FC<VirtualBoxInfo> = ({ id, crosshairPosition, name, height, width, top = '0', left = '0', right='0', onHit}) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);
    const [isHit, setIsHit] = useState(false);
    const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null); // Timer for target practice hover duration

    useEffect(() =>{
        if (!boxRef.current) return;

        // Will check if the crosshair is within the bounds of the virtual card
        const box = boxRef.current.getBoundingClientRect();
        const isInsideBox = 
        crosshairPosition.x >= box.left &&
        crosshairPosition.x <= box.right &&
        crosshairPosition.y >= box.top &&
        crosshairPosition.y <= box.bottom;

        if (!isInside && isInsideBox)
        {
          handleHoverStart(id);
        }
        else if (isInside && !isInsideBox)
        {
          handleHoverEnd();
        }

        setIsInside(isInsideBox);
    }, [crosshairPosition, isInside, onHit, id])

    // Start hover timer
    const handleHoverStart = (boxId: number) => {
      const timer = setTimeout(() => {
          onHit(boxId);
          setIsHit(true);
      }, 1000); // duration crosshair must be in card

      setHoverTimer(timer);
    }

    // Reset hover timer if crosshair leaves card
    const handleHoverEnd = () => {
      if (hoverTimer){
          clearTimeout(hoverTimer);
          console.log(`reset`);
          setHoverTimer(null);
      }
    }

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
            zIndex: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            height: '20px',
            width: '20px',
            backgroundColor: `${isHit ? 'green' : 'red'}`,
            borderRadius: '100%'
          }}/>
        </div>
    );
}

export default MemoryCard;