'use client';
import { WishBoard } from '@/components/wish-board';
import { Header } from '@/components/header';
import { useWishBoard } from '@/hooks/use-wish-board';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { cards, addCard, updateCard, updateCardPosition, isLoading } = useWishBoard();

  return (
    <main className="relative h-screen w-screen overflow-auto bg-background font-body">
      <Header addCard={addCard} cards={cards} />
      {isLoading ? (
        <div className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <WishBoard
          cards={cards}
          updateCard={updateCard}
          updateCardPosition={updateCardPosition}
        />
      )}
    </main>
  );
}
