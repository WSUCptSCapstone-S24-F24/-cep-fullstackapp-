import React, { useState, useEffect } from 'react';
import VirtualBox from './virtual_box';

interface Box {
    id: number;
    name: string;
    height: string;
    width: string;
    top: string;
    left: string;
}

interface BoxContainerInformation{
    crosshairPosition: {
        x: number,
        y: number
    };
}

const BoxContainer: React.FC<BoxContainerInformation> = ({ crosshairPosition }) => {
    // --Target practice boxes
    const [currentBox, setCurrentBox] = useState<Box | null>(null);
    const [boxQueue, setBoxQueue] = useState<Box[]>([]);

    // Initialize our box queue here
    useEffect(() => {
        const boxes: Box[] = generateBoxes(5, {width: 100, height: 100});
        setBoxQueue(boxes);
        setCurrentBox(boxes[0]);
      }, [])
      
      // Cycle through each box in our queue
      useEffect(() => {
        if (!currentBox || boxQueue.length == 0) return;

        const timer = setTimeout(() => {
            // Next box
            const nextIndex = (boxQueue.indexOf(currentBox) + 1) % boxQueue.length;
            setCurrentBox(boxQueue[nextIndex]);
        }, 5000); // Change box every 5 seconds

        return () => clearTimeout(timer);
      }, [currentBox, boxQueue]);

  
      // Generate target box array
      const generateBoxes = (numberOfBoxes: number, size: {width: number, height: number; }): Box[] => {
        return Array.from({ length: numberOfBoxes }, (_, i) => ({
          id: i,
          name: `Target ${i}`,
          height: `${size.height}px`,
          width: `${size.width}px`,
          top: `${Math.random() * (window.innerHeight - size.height)}px`,
          left: `${Math.random() * (window.innerWidth - size.width)}px`
        }));
      }

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            {currentBox && (
                <VirtualBox
                    key={currentBox.id}
                    crosshairPosition={crosshairPosition} /* Will need to update with actual position */
                    name={currentBox.name}
                    height={currentBox.height}
                    width={currentBox.width}
                    top={currentBox.top}
                    left={currentBox.left}
                />
            )}
        </div>
    );
};      
export default BoxContainer;