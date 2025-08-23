'use client';
import { WishBoard } from '@/components/wish-board';
import { Header } from '@/components/header';
import { useWishBoard } from '@/hooks/use-wish-board';

export default function Home() {
  const { cards, addCard, updateCard, updateCardPosition } = useWishBoard();

  return (
    <main className="relative h-screen w-screen overflow-auto bg-background font-body">
      <Header addCard={addCard} cards={cards} />
      <WishBoard
        cards={cards}
        updateCard={updateCard}
        updateCardPosition={updateCardPosition}
      />
    </main>
  );
}
