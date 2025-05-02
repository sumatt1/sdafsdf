"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps {
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export function Card({ icon: Icon, isFlipped, isMatched, onClick }: CardProps) {
  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "aspect-square rounded-lg shadow-md cursor-pointer perspective",
        "transition-transform duration-500 transform-style-3d",
        isFlipped || isMatched ? "rotate-y-180" : ""
      )}
      onClick={handleClick}
      aria-hidden={isMatched}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d'}}
    >
      {/* Card Inner Container */}
      <div className="relative w-full h-full duration-500 transform-style-3d">
        {/* Card Front (Icon) */}
        <div className={cn(
            "absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center bg-card text-card-foreground",
            "rotate-y-180"
            )}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}
            >
          <Icon className="w-1/2 h-1/2 text-primary" />
        </div>

        {/* Card Back (Pattern/Color) */}
        <div className={cn(
            "absolute w-full h-full backface-hidden rounded-lg bg-card-back", // Use themed card-back color
            "flex items-center justify-center" // Optional: Add a pattern or logo here
            )}
            style={{ backfaceVisibility: 'hidden'}}
            >
          {/* You could add a subtle pattern or logo here */}
        </div>
      </div>
    </div>
  );
}
