import { WishCard } from './wish-card';
import type { WishCardData } from '@/lib/types';

interface WishBoardProps {
  cards: WishCardData[];
  updateCard: (card: WishCardData) => void;
  updateCardPosition: (id: string, position: { x: number; y: number }) => void;
}

export function WishBoard({ cards, updateCard, updateCardPosition }: WishBoardProps) {
  return (
    <div className="absolute inset-0 h-full w-full">
      <div className="relative h-[200vh] w-[200vw]">
        {cards.map((card) => (
          <WishCard
            key={card.id}
            card={card}
            updateCard={updateCard}
            updateCardPosition={updateCardPosition}
          />
        ))}
      </div>
    </div>
  );
}
