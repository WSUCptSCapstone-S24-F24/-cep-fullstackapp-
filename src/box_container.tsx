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
    const [hasCompletedCycle, setHasCompletedCycle] = useState<boolean>(false);

    // Initialize our box queue here
    useEffect(() => {
        const boxes: Box[] = generateBoxes(5, {width: 200, height: 200});    // This is where we set how much boxes and how big the boxes
        setBoxQueue(boxes);
        setCurrentBox(boxes[0]);
      }, [])
      
      // Cycle through each box in our queue
      useEffect(() => {
        if (!currentBox || boxQueue.length == 0 || hasCompletedCycle) return;

        const currentIndex = boxQueue.indexOf(currentBox);
        const nextIndex = currentIndex + 1;

        if (nextIndex > boxQueue.length){
            setHasCompletedCycle(true);
            setCurrentBox(null);
            return;
        }

        const timer = setTimeout(() => {
            // Next box
            setCurrentBox(boxQueue[nextIndex]);
        }, 3000); // This is where we change how long each box lasts (ex: 5000 = 5 seconds)

        return () => clearTimeout(timer);
      }, [currentBox, boxQueue, hasCompletedCycle]);

  
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
                    crosshairPosition={crosshairPosition}
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