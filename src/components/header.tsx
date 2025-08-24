import { MemoryForm } from './memory-form';
import type { MemoryCardData } from '@/lib/types';
import { ShareBoardButton } from './share-board-button';
import { Logo } from './logo';
import { Heart, PartyPopper, MessageSquare } from 'lucide-react';

interface HeaderProps {
  addCard: (card: Omit<MemoryCardData, 'id' | 'createdAt' | 'position'>) => void;
  cards: MemoryCardData[];
}

export function Header({ addCard, cards }: HeaderProps) {
  const totalCards = cards.length;
  const totalLoves = cards.reduce((sum, card) => sum + (card.reactions?.love || 0), 0);
  const totalCelebrations = cards.reduce((sum, card) => sum + (card.reactions?.celebration || 0), 0);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8" />
        <h1 className="text-xl md:text-3xl font-headline font-bold text-white">
          Amani Kanu
        </h1>
      </div>
      <div className="flex  flex-col-reverse md:flex-row items-center gap-4">
        <div className="flex items-center gap-4 text-white pr-4">
          <div className="flex items-center gap-1" title={`${totalCards} wishes`}>
            <MessageSquare className="h-5 w-5" />
            <span className="font-bold">{totalCards}</span>
          </div>
          <div className="flex items-center gap-1" title={`${totalLoves} loves`}>
            <Heart className="h-5 w-5" />
            <span className="font-bold">{totalLoves}</span>
          </div>
          <div className="flex items-center gap-1" title={`${totalCelebrations} celebrations`}>
            <PartyPopper className="h-5 w-5" />
            <span className="font-bold">{totalCelebrations}</span>
          </div>
        </div>
        {/* <ShareBoardButton cards={cards} /> */}
        <MemoryForm onSave={addCard} />
      </div>
    </header>
  );
}
