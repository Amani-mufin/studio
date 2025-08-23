'use client';

import type { WishCardData, ReactionType } from '@/lib/types';
import { useState, useRef, type MouseEvent, useTransition, useCallback } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Wand2, Loader, GripVertical, Download, Heart, PartyPopper, Hand } from 'lucide-react';
import { WishForm } from './wish-form';
import { getPoemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import * as htmlToImage from 'html-to-image';

interface WishCardProps {
  card: WishCardData;
  updateCard: (card: WishCardData) => void;
  deleteCard: (id: string) => void;
  updateCardPosition: (id: string, position: { x: number; y: number }) => void;
}

export function WishCard({ card, updateCard, deleteCard, updateCardPosition }: WishCardProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleDragStart = (e: MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    isDragging.current = true;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd, { once: true });
    cardRef.current.style.cursor = 'grabbing';
    cardRef.current.style.zIndex = '10';
  };

  const handleDragMove = (e: globalThis.MouseEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const newX = card.position.x + dx;
    const newY = card.position.y + dy;
    cardRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
  };

  const handleDragEnd = (e: globalThis.MouseEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDragMove);
    cardRef.current.style.cursor = 'grab';
    cardRef.current.style.zIndex = '1';
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const newX = card.position.x + dx;
    const newY = card.position.y + dy;
    cardRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    updateCardPosition(card.id, { x: newX, y: newY });
  };

  const generatePoem = () => {
    startTransition(async () => {
      const result = await getPoemAction(card.wish);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Poem Generation Failed',
          description: result.error,
        });
      } else if (result.poem) {
        updateCard({ ...card, poem: result.poem });
        toast({
          title: 'Poem Generated!',
          description: 'A magical poem has been woven for your wish.',
        });
      }
    });
  };

  const handleDownload = useCallback(() => {
    if (cardRef.current) {
      htmlToImage.toJpeg(cardRef.current, { quality: 0.95 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `wish-${card.id}.jpeg`;
          link.href = dataUrl;
          link.click();
        });
    }
  }, [card.id]);

  const handleReaction = (reactionType: ReactionType) => {
    const updatedCard = {
      ...card,
      reactions: {
        ...card.reactions,
        [reactionType]: card.reactions[reactionType] + 1,
      },
    };
    updateCard(updatedCard);
  };
  
  return (
    <Card
      ref={cardRef}
      className="absolute w-[300px] min-h-[150px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-primary/50 hover:scale-105 group"
      style={{
        transform: `translate(${card.position.x}px, ${card.position.y}px)`,
        backgroundColor: card.style.backgroundColor,
        color: card.style.textColor,
        fontFamily: card.style.fontFamily,
        fontSize: `${card.style.fontSize}px`,
      }}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{card.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-grab group-hover:opacity-100 opacity-0 transition-opacity"
            onMouseDown={handleDragStart}
            aria-label="Drag card"
          >
            <GripVertical className="h-5 w-5" />
          </Button>
        </CardTitle>
        <CardDescription style={{ color: card.style.textColor, opacity: 0.8 }}>
          {format(new Date(card.createdAt), "PPP, p")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {card.imageUrl && (
          <div className="relative h-40 mb-4 rounded-md overflow-hidden">
            <Image src={card.imageUrl} alt={card.name} layout="fill" objectFit="cover" data-ai-hint="celebration event" />
          </div>
        )}
        <p className="whitespace-pre-wrap">{card.wish}</p>
        {card.poem && (
          <div className="mt-4 p-3 border-l-4 border-primary/50 italic bg-white/10 rounded-r-md">
            <p className="whitespace-pre-wrap text-sm">{card.poem}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-1">
          <WishForm cardData={card} onSave={updateCard} />
          <Button variant="ghost" size="icon" aria-label="Download card" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Delete card">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this wish. This action cannot be undone.
                </