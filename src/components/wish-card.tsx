'use client';

import type { WishCardData, ReactionType } from '@/lib/types';
import { useState, useRef, type MouseEvent, useTransition, useCallback, useEffect } from 'react';
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
import { Wand2, Loader, GripVertical, Download, Heart, PartyPopper } from 'lucide-react';
import { WishForm } from './wish-form';
import { getPoemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import * as htmlToImage from 'html-to-image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


interface WishCardProps {
  card: WishCardData;
  updateCard: (card: WishCardData) => void;
  updateCardPosition: (id: string, position: { x: number; y: number }) => void;
  isMobileView?: boolean;
}

export function WishCard({ card, updateCard, updateCardPosition, isMobileView = false }: WishCardProps) {
  const { toast } = useToast();
  const [isPoemPending, startPoemTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const wishTextRef = useRef<HTMLParagraphElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    if (card.poem) {
      setShowReadMore(true);
      return;
    }
    if (wishTextRef.current) {
      // Show if text is truncated (overflows one line)
      const isOverflowing = wishTextRef.current.scrollHeight > wishTextRef.current.clientHeight;
      setShowReadMore(isOverflowing);
    }
  }, [card.poem, card.wish]);

  const handleDragStart = (e: MouseEvent<HTMLButtonElement>) => {
    if (isMobileView || !cardRef.current) return;
    isDragging.current = true;
    dragStartPos.current = {
      x: e.clientX - card.position.x,
      y: e.clientY - card.position.y,
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd, { once: true });
    cardRef.current.style.cursor = 'grabbing';
    cardRef.current.style.zIndex = '10';
  };

  const handleDragMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    cardRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
  }, []);

  const handleDragEnd = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDragMove);
    cardRef.current.style.cursor = 'grab';
    cardRef.current.style.zIndex = '1';
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    updateCardPosition(card.id, { x: newX, y: newY });
  }, [card.id, updateCardPosition, handleDragMove]);

  const generatePoem = () => {
    startPoemTransition(async () => {
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
      const originalTransform = cardRef.current.style.transform;
      if (!isMobileView) {
        cardRef.current.style.transform = '';
      }
      
      htmlToImage.toJpeg(cardRef.current, { 
        quality: 0.95,
        backgroundColor: card.style.background.startsWith('#') ? card.style.background : '#1e1e1e',
        style: {
          color: card.style.textColor,
          fontFamily: card.style.fontFamily,
        },
      }).then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `wish-${card.id}.jpeg`;
          link.href = dataUrl;
          link.click();
          if (cardRef.current && !isMobileView) {
            cardRef.current.style.transform = originalTransform;
          }
        }).catch((error) => {
          console.error('oops, something went wrong!', error);
           if (cardRef.current && !isMobileView) {
            cardRef.current.style.transform = originalTransform;
          }
        });
    }
  }, [card.id, card.style, isMobileView]);

  const handleReaction = (reactionType: ReactionType) => {
    const updatedCard = {
      ...card,
      reactions: {
        ...card.reactions,
        [reactionType]: (card.reactions[reactionType] || 0) + 1,
      },
    };
    updateCard(updatedCard);
  };
  
  const backgroundStyle = card.style?.background || 'bg-gradient-pink';

  return (
    <TooltipProvider>
    <Card
      ref={cardRef}
      className={cn(
        "w-[300px] min-h-[150px] transition-all duration-300 ease-in-out group",
        isMobileView ? "relative w-full max-w-sm" : "absolute hover:animate-shake",
      )}
      style={{
        ...(!isMobileView && { transform: `translate(${card.position.x}px, ${card.position.y}px)` }),
        color: card.style.textColor,
        fontFamily: card.style.fontFamily,
        ...(backgroundStyle.startsWith('#')
          ? { backgroundColor: backgroundStyle }
          : {}),
      }}
      data-background-class={!backgroundStyle.startsWith('#') ? backgroundStyle : ''}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{card.name}</span>
            {!isMobileView && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-grab group-hover:opacity-100 opacity-0 transition-opacity hover:bg-white/20"
                    onMouseDown={handleDragStart}
                    aria-label="Drag card"
                  >
                    <GripVertical className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Drag</p>
                </TooltipContent>
              </Tooltip>
            )}
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
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <p ref={wishTextRef} className={cn("whitespace-pre-wrap", !isExpanded && "line-clamp-1")}>
            {card.wish}
          </p>
          <CollapsibleContent>
            {card.poem && (
              <div className="mt-4 p-3 border-l-4 border-primary/50 italic bg-white/10 rounded-r-md">
                <p className="whitespace-pre-wrap text-sm">{card.poem}</p>
              </div>
            )}
          </CollapsibleContent>
          {showReadMore && (
            <CollapsibleTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-xs mt-2" style={{color: card.style.textColor}}>
                {isExpanded ? 'Read less' : 'Read more'}
              </Button>
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </CardContent>
      <CardFooter className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-1 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Love" onClick={() => handleReaction('love')} className="flex items-center gap-1 px-2 hover:bg-white/20">
                <Heart className="h-4 w-4" /> 
                <span className="text-xs">{card.reactions.love || 0}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Love</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Celebrate" onClick={() => handleReaction('celebration')} className="flex items-center gap-1 px-2 hover:bg-white/20">
                <PartyPopper className="h-4 w-4" />
                <span className="text-xs">{card.reactions.celebration || 0}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Celebrate</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <WishForm cardData={card} onSave={updateCard} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Generate poem" onClick={generatePoem} disabled={isPoemPending} className="hover:bg-white/20">
                {isPoemPending ? <Loader className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate Poem</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Download card" onClick={handleDownload} className="hover:bg-white/20">
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
    </TooltipProvider>
  );
}
