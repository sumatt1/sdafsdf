"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Plane,
  Anchor,
  Gift,
  HelpCircle,
} from "lucide-react";
import { shuffleArray } from "@/lib/game-utils";
import { Card } from "./card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CardData {
  id: number;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
}

const icons: LucideIcon[] = [
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Plane,
  Anchor,
  Gift,
];

const generateCards = (): CardData[] => {
  const cardIcons = [...icons, ...icons]; // Create pairs
  const shuffledIcons = shuffleArray(cardIcons);
  return shuffledIcons.map((Icon, index) => ({
    id: index,
    icon: Icon || HelpCircle, // Fallback icon
    isFlipped: false,
    isMatched: false,
  }));
};

export function GameBoard() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false); // Prevent clicking during check
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const initializeGame = useCallback(() => {
    setCards(generateCards());
    setFlippedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsChecking(false);
    setElapsedTime(0);
    setIsGameComplete(false);
    setStartTime(null); // Reset start time until first move
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (startTime && !isGameComplete) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (!startTime || isGameComplete) {
      if (intervalId) clearInterval(intervalId);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [startTime, isGameComplete]);

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    // Start timer on first move
    if (!startTime) {
      setStartTime(Date.now());
    }

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // Flip the card
    setCards((prevCards) =>
      prevCards.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );

    setMoves((prevMoves) => prevMoves + 1);

    // Check for match if two cards are flipped
    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.icon === secondCard.icon) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.icon === firstCard.icon
              ? { ...card, isMatched: true, isFlipped: true } // Keep matched cards flipped
              : card
          )
        );
        setMatchedPairs((prev) => prev + 1);
        setFlippedIndices([]);
        setIsChecking(false);
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card, i) =>
              i === firstIndex || i === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000); // 1 second delay
      }
    }
  };

  useEffect(() => {
     if (matchedPairs > 0 && matchedPairs === icons.length) {
      setIsGameComplete(true);
      // Optionally, add a delay before showing completion message or trigger effect
      // console.log("Game Complete!");
     }
  }, [matchedPairs]);


  const gridCols = useMemo(() => {
    const numCards = cards.length;
    if (numCards <= 4) return 'grid-cols-2';
    if (numCards <= 9) return 'grid-cols-3';
    if (numCards <= 16) return 'grid-cols-4';
    return 'grid-cols-4'; // Default or fallback
  }, [cards.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <h1 className="text-3xl font-bold mb-4 text-primary">Memory Lane</h1>

        {isGameComplete ? (
         <div className="text-center mb-6 p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-accent mb-2">Congratulations!</h2>
            <p className="text-lg">You completed the game!</p>
            <p className="text-muted-foreground">Moves: {moves}</p>
            <p className="text-muted-foreground">Time: {elapsedTime} seconds</p>
          </div>
        ) : (
         <div className="flex justify-between w-full max-w-md mb-4 text-lg">
           <p>Moves: <span className="font-semibold text-primary">{moves}</span></p>
           <p>Time: <span className="font-semibold text-primary">{elapsedTime}s</span></p>
         </div>
        )}


      <div className={`grid ${gridCols} gap-4 w-full max-w-md mb-6`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            icon={card.icon}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
        <Button onClick={initializeGame} variant="default" size="lg">
            <RefreshCw className="mr-2 h-5 w-5" /> Reset Game
        </Button>
    </div>
  );
}
