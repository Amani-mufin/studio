'use client';
import { WishBoard } from '@/components/wish-board';
import { Header } from '@/components/header';
import { useWishBoard } from '@/hooks/use-wish-board';
import { useEffect, useState } from 'react';

export default function Home() {
  const { cards, addCard, updateCard, updateCardPosition } = useWishBoard();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-auto bg-background font-body">
      <Header addCard={addCard} />
      {isClient ? (
        <WishBoard
          cards={cards}
          updateCard={updateCard}
          updateCardPosition={updateCardPosition}
        />
      ) : null}
    </main>
  );
}
