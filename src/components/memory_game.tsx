import React, { useState, useEffect, useRef } from 'react';
import { MemoryCardBox, MemoryGameProps } from '../types/interfaces';
import MemoryCard from './memory_card';
import { shuffle } from 'd3';

const MemoryGame: React.FC<MemoryGameProps> = ({ crosshairPosition, rowSize, colSize, DPI }) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const [cardQueue, setCardQueue] = useState<MemoryCardBox[]>([]);
    const [visibleCards, setVisibleCards] = useState<number[]>([]);
    const [matchedCards, setMatchedCards] = useState<number[]>([]);
    const [score, setScore] = useState<number>(0);
    const [attempts, setAttempts] = useState<number>(0);
    const [cardSize, setCardSize] = useState({width: 0, height: 0 });
    const row = rowSize;
    const col = colSize;
    const scoreBonus = 10; // Amount of score we gain when we correctly match 2 cards

    const generateEmojiRange = (start: number, end: number) => {
        let emojis = [];
        for (let i = start; i <= end; i++){
            emojis.push(String.fromCodePoint(i));
        }
        return emojis;
    }

    // Get every emoji from unicode ranges
    // Taken from Chat GPT
    const emojiList = [
        ...generateEmojiRange(0x1F600, 0x1F64F), 
        ...generateEmojiRange(0x1F300, 0x1F5FF), 
        ...generateEmojiRange(0x1F680, 0x1F6FF), 
        ...generateEmojiRange(0x2600, 0x26FF)    
    ];

    // Initialize our box queue here
    useEffect(() => {
        const cards: MemoryCardBox[] = generateCards(rowSize * colSize); 
        setCardQueue(cards);
      }, [])

      // Generate target card array
      const generateCards = (numberOfCards: number): MemoryCardBox[] => {
        const half = numberOfCards / 2;

        let pairedImages = emojiList.slice(0, half);

        pairedImages = [...pairedImages, ...pairedImages];

        shuffle(pairedImages);

        return pairedImages.map((emoji, index) => ({
            id: index,
            name: `Card ${index + 1}`,
            emoji: emoji,
            height: `1fr`,
            width: `1fr`,
            top: `1fr`,
            left: `1fr`,
            hit: false,
        }));
      };

      const calculateCardSize = () => {
        if (containerRef.current){
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;

            const cardWidth = containerWidth / colSize;
            const cardHeight = containerHeight / rowSize;

            setCardSize({width: cardWidth, height: cardHeight});
        }
      }

      // Calculate the size of each card whenever the window size changes
    useEffect(() => {
        window.addEventListener('resize', calculateCardSize);
        calculateCardSize(); // initial calculation

        return () => {
            window.removeEventListener('resize', calculateCardSize);
        };
    }, [rowSize, colSize]);

      const handleBoxHit = (cardId: number) => {
        // Ensure only 2 cards are visible at once
        if (visibleCards.length >= 2 || matchedCards.includes(cardId) || cardId === visibleCards[0]){
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
                if (firstCard.emoji === secondCard.emoji){
                    // Cards match, remove both cards
                    setTimeout(() => {
                        setMatchedCards(currentCard => [...currentCard, firstCardId, secondCardId]);
                        setVisibleCards([]);
                        setScore(score + scoreBonus);
                    }, 1000); // Delay before cards are removed
                } else {
                    setTimeout(() => {
                        setCardQueue(currentCards => currentCards.map(card => card.id === firstCardId || card.id == secondCardId ? {...card, hit: false} : card));
                        setVisibleCards([]);
                    }, 1000);
                }
            }
            setAttempts(attempts + 1);
        }
    };

    return (
        <div
        ref={containerRef}
        style={{
            display: `grid`,
            gridTemplateColumns: `repeat(${col}, 1fr)`,
            gridTemplateRows: `repeat(${row}, 1fr)`,
            gap: `10px`,
            height: `100vh`,
            width: `100vw`,
            padding: `10px`,
            boxSizing: `border-box`
        }}>
            {/*Display score*/}
            <div style={{ position: 'absolute', bottom: '10px', right: "10px", zIndex: 20, fontSize: "3vh"}}>
                <p>Score: {score}</p>
                <p>Attempts: {attempts}</p>
                <p>Card Size: {Math.floor(cardSize.width)}px x {Math.floor(cardSize.height)}px</p>
            </div>

            {/* Fill the cards to the grid */}
            {cardQueue.map(card => (
                <MemoryCard
                    key={card.id}
                    id={card.id}
                    crosshairPosition={crosshairPosition}
                    name={card.name}
                    emoji={card.emoji}
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