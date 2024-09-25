import React, { useState, useEffect, useRef } from 'react';
import { BoxContainerInformation, Box } from '../types/interfaces';
import MemoryCard from './memory_card';
import { cross } from 'd3';

const MemoryGame: React.FC<BoxContainerInformation> = ({ crosshairPosition }) => {

    const [cardQueue, setCardQueue] = useState<Box[]>([]);

    // Initialize our box queue here
    useEffect(() => {
        const cards: Box[] = generateCards(16); 
        setCardQueue(cards);
      }, [])

      // Generate target card array
      const generateCards = (numberOfCards: number): Box[] => {
        return Array.from({length: numberOfCards}).map((_, index) => ({
            id: index,
            name: `Card ${index + 1}`,
            height: `1fr`,
            width: `1fr`,
            top: `1fr`,
            left: `1fr`,
            hit: false,
        }));
      };

      const handleBoxHit = (cardId: number) => {
        setCardQueue(currentCard =>
            currentCard.map(card =>
                card.id === cardId ? { ...card, hit: true } : card
            )
        );
    };

    return (
        <div style={{
            display: `grid`,
            gridTemplateColumns: `repeat(4, 1fr)`,
            gridTemplateRows: `repeat(4, 1fr)`,
            gap: `10px`,
            height: `100vh`,
            width: `100vw`,
            padding: `10px`,
            boxSizing: `border-box`
        }}>
            {/* Fill the cards to the grid */}
            {cardQueue.map(card => (
                <MemoryCard
                    key={card.id}
                    id={card.id}
                    crosshairPosition={crosshairPosition}
                    name={card.name}
                    height={`100%`}
                    width={`100%`}
                    onHit={handleBoxHit}
                />
            ))}
        </div>
    )
};

export default MemoryGame;