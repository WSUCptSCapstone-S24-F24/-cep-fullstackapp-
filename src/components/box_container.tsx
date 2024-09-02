import React, { useState, useEffect } from 'react';
import VirtualBox from './virtual_box';
import { BoxContainerInformation, Box } from '../types/interfaces';

const BoxContainer: React.FC<BoxContainerInformation> = ({ crosshairPosition }) => {
    // --Target practice boxes
    const [currentBoxIndex, setCurrentBoxIndex] = useState<number>(0);
    const [boxQueue, setBoxQueue] = useState<Box[]>([]);
    const [hasCompletedCycle, setHasCompletedCycle] = useState<boolean>(false);

    // Initialize our box queue here
    useEffect(() => {
        const boxes: Box[] = generateBoxes(16, {width: 150, height: 150});    // This is where we set how much boxes and how big the boxes
        setBoxQueue(boxes);
      }, [])
      
    // Cycle through each box in our queue
    useEffect(() => {
        if (boxQueue.length == 0 || hasCompletedCycle) return;

        if (currentBoxIndex >= boxQueue.length){
            setHasCompletedCycle(true);
            return;
        }

        const timer = setTimeout(() => {
            setCurrentBoxIndex((prevIndex) => prevIndex + 1);
          }, 3000); // Display each box for 3 seconds
      
          return () => clearTimeout(timer);
    }, [currentBoxIndex, boxQueue, hasCompletedCycle]);
    

  
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
        setBoxQueue((currentBoxes) => 
            currentBoxes.map((box) =>
                box.id === boxId ? {...box, hit: true} : box
            )
        ); 
      }

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            {!hasCompletedCycle && boxQueue[currentBoxIndex] && (
                <VirtualBox
                    key={boxQueue[currentBoxIndex].id}
                    id={boxQueue[currentBoxIndex].id}
                    crosshairPosition={crosshairPosition}
                    name={boxQueue[currentBoxIndex].name}
                    height={boxQueue[currentBoxIndex].height}
                    width={boxQueue[currentBoxIndex].width}
                    top={boxQueue[currentBoxIndex].top}
                    left={boxQueue[currentBoxIndex].left}
                    onHit={handleBoxHit}
                />
            )}
            {hasCompletedCycle && boxQueue
                .filter((box) => !box.hit)
                .map((missedBox) => (
                    <div
                        key={`missed-${missedBox.id}`}
                        style={{
                            position:  'absolute',
                            top: missedBox.top,
                            left: missedBox.left,
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'blue',
                            borderRadius: '50%',
                            zIndex: 10,
                        }}
                    />
                ))}
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