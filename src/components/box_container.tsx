import React, { useState, useEffect } from 'react';
import VirtualBox from '../virtual_box';

interface Box {
    id: number;
    name: string;
    height: string;
    width: string;
    top: string;
    left: string;
    hit: boolean;
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
        const boxes: Box[] = generateBoxes(16, {width: 150, height: 150});    // This is where we set how much boxes and how big the boxes
        setBoxQueue(boxes);
        setCurrentBox(boxes[0]);
      }, [])
      
      // Cycle through each box in our queue
      useEffect(() => {
        if (!currentBox || hasCompletedCycle) return;

        // Use a stable reference to the next box index to avoid dependency on mutable state
        let nextIndex = boxQueue.indexOf(currentBox) + 1;

        const timer = setTimeout(() => {
            if (nextIndex > boxQueue.length) 
            {
                setHasCompletedCycle(true);
                setCurrentBox(null);
            } 
            else
            {
                setCurrentBox(boxQueue[nextIndex]);
            }
        }, 3000);

        return () => clearTimeout(timer);
      }, [currentBox, hasCompletedCycle]);

  
      // Generate target box array
      const generateBoxes = (numberOfBoxes: number, size: {width: number, height: number; }): Box[] => {
        const rows = 4;
        const cols = 4;
        const zoneWidth = window.innerWidth / rows;
        const zoneHeight = window.innerHeight / cols;

        let zonePoints = [];
        for (let row = 0; row < rows; row++){
            for (let col = 0; col < cols; col++){
                // Center each box in a cell
                const point = {
                    top: zoneHeight * col + (zoneHeight - size.height) / 2,
                    left: zoneWidth * row + (zoneWidth - size.width) / 2,
                };
                zonePoints.push(point);
            }
        }

        // Randomize box positions
        zonePoints = zonePoints.sort(() => Math.random() - 0.5);

        // Create boxes in order of zonePoints
        return zonePoints.slice(0, numberOfBoxes).map((point, index) => ({
            id: index,
            name: `Target ${index + 1}`,
            height: `${size.height}px`,
            width: `${size.width}px`,
            top: `${point.top}px`,
            left: `${point.left}px`,
            hit: false
        }));
      }

      const handleBoxHit = (boxId: number) => {
        setBoxQueue(currentBox => 
            currentBox.map(box =>
                box.id === boxId ? {...box, hit: true} : box
            )
        ); 
      }

      

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            {currentBox && (
                <VirtualBox
                    id={currentBox.id}
                    key={currentBox.id}
                    crosshairPosition={crosshairPosition}
                    name={currentBox.name}
                    height={currentBox.height}
                    width={currentBox.width}
                    top={currentBox.top}
                    left={currentBox.left}
                    onHit={handleBoxHit}
                />
            )}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 20 }}>
                {/* Display the total number of hits */}
                <p>Current Hits: {boxQueue.filter(box => box.hit).length}</p>
                <p>Total Hits: {boxQueue.filter(box => box.hit).length} / {boxQueue.length}</p>
                <p>Accuracy: {((boxQueue.filter(box => box.hit).length / boxQueue.length) * 100).toFixed(2)}%</p>
            </div>
        </div>
    );
};      
export default BoxContainer;