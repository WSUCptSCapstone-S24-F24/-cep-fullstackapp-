import React, { useState, useEffect, useRef } from 'react';
import { BoxContainerInformation, MemoryCardBox } from '../types/interfaces';
import MemoryCard from './memory_card';
import { shuffle } from 'd3';

const MemoryGame: React.FC<BoxContainerInformation> = ({ crosshairPosition }) => {

    const [cardQueue, setCardQueue] = useState<MemoryCardBox[]>([]);
    const [visibleCards, setVisibleCards] = useState<number[]>([]);
    const [matchedCards, setMatchedCards] = useState<number[]>([]);
    const rowSize = 4;
    const colSize = 4;

    // Initialize our box queue here
    useEffect(() => {
        const cards: MemoryCardBox[] = generateCards(rowSize * colSize); 
        setCardQueue(cards);
      }, [])

      // Generate target card array
      const generateCards = (numberOfCards: number): MemoryCardBox[] => {
        const half = numberOfCards / 2;

        const images = [
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f92c.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f611.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/2620-fe0f.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f47a.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f92f.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f644.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f62b.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f92a.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f641.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f634.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f912.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f47f.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f47d.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f92e.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f624.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f921.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f48e.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f31a.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f31e.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/1f31b.png',
            'https://emoji.aranja.com/static/emoji-data/img-apple-160/2603-fe0f.png'
        ];

        let pairedImages = images.slice(0, half);

        pairedImages = [...pairedImages, ...pairedImages];

        shuffle(pairedImages);

        return pairedImages.map((imageSrc, index) => ({
            id: index,
            name: `Card ${index + 1}`,
            imageSrc: imageSrc,
            height: `1fr`,
            width: `1fr`,
            top: `1fr`,
            left: `1fr`,
            hit: false,
        }));
      };

      const handleBoxHit = (cardId: number) => {
        // Ensure only 2 cards are visible at once
        if (visibleCards.length >= 2 || matchedCards.includes(cardId)){
            return;
        }

        const newVisibleCards = [...visibleCards, cardId];

        // Set new card to visible cards
        setVisibleCards(newVisibleCards);

        // Reveal hidden card
        setCardQueue(currentCard =>
            currentCard.map(card =>
                card.id === cardId ? { ...card, hit: true } : card
            )
        );


        // check if both visible cards have a match
        if (newVisibleCards.length === 2){
            const [firstCardId, secondCardId] = newVisibleCards;
            const firstCard = cardQueue.find(card => card.id === firstCardId);
            const secondCard = cardQueue.find(card => card.id === secondCardId);

            if (firstCard && secondCard){
                if (firstCard.imageSrc === secondCard.imageSrc){
                    // Cards match, remove both cards
                    setTimeout(() => {
                        setMatchedCards(currentCard => [...currentCard, firstCardId, secondCardId]);
                        setVisibleCards([]);
                    }, 1000); // Delay before cards are removed
                } else {
                    setTimeout(() => {
                        setCardQueue(currentCards => currentCards.map(card => card.id === firstCardId || card.id == secondCardId ? {...card, hit: false} : card));
                        setVisibleCards([]);
                    }, 1000);
                }
            }
        }
    };

    return (
        <div style={{
            display: `grid`,
            gridTemplateColumns: `repeat(${colSize}, 1fr)`,
            gridTemplateRows: `repeat(${rowSize}, 1fr)`,
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
                    imageSrc={card.imageSrc}
                    height={`100%`}
                    width={`100%`}
                    onHit={handleBoxHit}
                    isHit={visibleCards.includes(card.id) || matchedCards.includes(card.id)}
                    isMatched={matchedCards.includes(card.id)}
                />
            ))}
        </div>
    )
};

export default MemoryGame;