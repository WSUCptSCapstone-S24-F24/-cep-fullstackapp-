import React from 'react';
import {useRef, useEffect, useState} from 'react'
import { MemoryCardInfo } from '../types/interfaces';

const MemoryCard: React.FC<MemoryCardInfo> = ({ id, crosshairPosition, name, emoji, height, width, top = '0', left = '0', right='0', onHit, isHit, isMatched}) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);
    const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null); // Timer for target practice hover duration
    const [fontSize, setFontSize] = useState('10rem'); // default font size

    // Calculate font size based on card dimensions
    useEffect(() => {
      if (boxRef.current) {
          const { offsetWidth, offsetHeight } = boxRef.current;
          const smallerDimension = Math.min(offsetWidth, offsetHeight);
          const calculatedFontSize = `${smallerDimension * 0.5}px`;
          setFontSize(calculatedFontSize);
      }
    }, [height, width]);

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
    };

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
            justifyContent: 'center',
            backgroundColor: isHit ? 'transparent' : 'gray',
            boxSizing: 'border-box',
            aspectRatio: '1',
            overflow: 'hidden',
            visibility: isMatched ? 'hidden' : 'visible',
            fontSize: fontSize,
            transition: 'font-size 0.2s ease'
          }}
        >

          {isHit ? (
            <span>{emoji}</span>
          ) : (
            <div style={{
              height: '0px',
              width: '0px',
              backgroundColor: 'green',
              borderRadius: '100%'
            }} />
          )}
        </div>
    );
}

export default MemoryCard;