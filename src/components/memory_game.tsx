import React, { useState, useEffect, useRef } from 'react';
import { BoxContainerInformation, Box } from '../types/interfaces';
import MemoryCard from './memory_card';

const MemoryGame: React.FC<BoxContainerInformation> = ({ crosshairPosition }) => {

    const [cardQueue, setCardQueue] = useState<Box[]>([]);

    // Initialize our box queue here
    useEffect(() => {
        const cards: Box[] = generateCards(16, {width: 100, height: 100}); 
        setCardQueue(cards);
      }, [])

      // Generate target box array
      const generateCards = (numberOfCards: number, size: {width: number, height: number; }): Box[] => {
        const rows = 4;
        const cols = 4;
        const zoneWidth = (window.innerWidth - size.width * 2) / 3;
        const zoneHeight = (window.innerHeight - size.height * 2) / 3;

        let zonePoints = [];
        for (let row = 0; row < rows; row++){
            for (let col = 0; col < cols; col++){
                // Center each box in a cell
                const point = {
                    top: size.height + zoneHeight * col - size.height / 2,
                    left: size.width + zoneWidth * row - size.width / 2,
                };
                zonePoints.push(point);
            }
        }

        // Create boxes in order of zonePoints
        return zonePoints.slice(0, numberOfCards).map((point, index) => ({
            id: index,
            name: `Target ${index + 1}`,
            height: `${size.height}px`,
            width: `${size.width}px`,
            top: `${point.top}px`,
            left: `${point.left}px`,
            hit: false
        }));
      }

      const handleBoxHit = (cardId: number) => {
        setCardQueue(currentCard =>
            currentCard.map(card =>
                card.id === cardId ? { ...card, hit: true } : card
            )
        );
    };

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            {/* Display all the boxes at once */}
            {cardQueue.map(card => (
                <MemoryCard
                    key={card.id}
                    id={card.id}
                    crosshairPosition={crosshairPosition}
                    name={card.name}
                    height={card.height}
                    width={card.width}
                    top={card.top}
                    left={card.left}
                    onHit={handleBoxHit}
                />
            ))}
            </div>
    );
};

export default MemoryGame;