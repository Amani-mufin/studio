import { MemoryForm } from './memory-form';
import type { MemoryCardData } from '@/lib/types';
import { ShareBoardButton } from './share-board-button';
import { Logo } from './logo';

interface HeaderProps {
  addCard: (card: Omit<MemoryCardData, 'id' | 'createdAt' | 'position'>) => void;
  cards: MemoryCardData[];
}

export function Header({ addCard, cards }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8" />
        <h1 className="text-xl md:text-3xl font-headline font-bold text-white">
          Amani Kanu
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2">
        {/* <ShareBoardButton cards={cards} /> */}
        <MemoryForm onSave={addCard} />
      </div>
    </header>
  );
}
