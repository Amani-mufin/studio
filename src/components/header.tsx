import { WishForm } from './wish-form';
import type { WishCardData } from '@/lib/types';

interface HeaderProps {
  addCard: (card: Omit<WishCardData, 'id' | 'createdAt' | 'position'>) => void;
}

export function Header({ addCard }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-background/50 backdrop-blur-sm">
      <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">
        Wish Weaver
      </h1>
      <WishForm onSave={addCard} />
    </header>
  );
}
