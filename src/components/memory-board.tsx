import { MemoryCard } from './memory-card';
import type { MemoryCardData } from '@/lib/types';

interface MemoryBoardProps {
  cards: MemoryCardData[];
  updateCard: (card: MemoryCardData) => void;
  updateCardPosition: (id: string, position: { x: number; y: number }) => void;
}

export function MemoryBoard({ cards, updateCard, updateCardPosition }: MemoryBoardProps) {
  return (
    <div className="absolute inset-0 h-full w-full pt-20 sm:pt-0">
      {/* Mobile Layout: Single column */}
      <div className="sm:hidden p-4 flex flex-col items-center gap-4">
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            updateCard={updateCard}
            updateCardPosition={updateCardPosition}
            isMobileView={true}
          />
        ))}
      </div>

      {/* Desktop Layout: Draggable canvas */}
      <div className="hidden sm:block relative h-[200vh] w-[200vw]">
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            updateCard={updateCard}
            updateCardPosition={updateCardPosition}
            isMobileView={false}
          />
        ))}
      </div>
    </div>
  );
}
