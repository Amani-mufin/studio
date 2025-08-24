
'use client';

import type { MemoryCardData, ReactionType } from '@/lib/types';
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
import { Wand2, Loader, GripVertical, Download, Heart, PartyPopper, Share2, Mail, Phone, MessageCircle } from 'lucide-react';
import { MemoryForm } from './memory-form';
import { getPoemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import * as htmlToImage from 'html-to-image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


interface MemoryCardProps {
  card: MemoryCardData;
  updateCard: (card: MemoryCardData) => void;
  updateCardPosition: (id: string, position: { x: number; y: number }) => void;
  isMobileView?: boolean;
  currentUserId: string | null;
}

export function MemoryCard({ card, updateCard, updateCardPosition, isMobileView = false, currentUserId }: MemoryCardProps) {
  const { toast } = useToast();
  const [isPoemPending, startPoemTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const wishTextRef = useRef<HTMLParagraphElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const canEdit = currentUserId === card.userId;
  const hasLoved = currentUserId ? card.reactedUserIds?.love?.includes(currentUserId) : false;
  const hasCelebrated = currentUserId ? card.reactedUserIds?.celebration?.includes(currentUserId) : false;
  
  useEffect(() => {
    if (card.poem) {
      setShowReadMore(true);
      return;
    }
    if (wishTextRef.current) {
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
          description: 'A magical poem has been woven for your memory.',
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
        filter: (node) => {
          return !node.classList?.contains('exclude-from-download');
        },
      }).then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `memory-${card.id}.jpeg`;
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

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    
    try {
      const blob = await htmlToImage.toBlob(cardRef.current, {
         filter: (node) => !node.classList?.contains('exclude-from-download'),
      });

      if (!blob) {
        throw new Error('Failed to create image blob.');
      }

      const file = new File([blob], `memory-${card.id}.jpg`, { type: 'image/jpeg' });
      const shareData = {
        files: [file],
        title: `A memory from ${card.name}`,
        text: card.wish,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not supported in this browser.');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      toast({
        variant: 'destructive',
        title: 'Sharing Failed',
        description: 'Could not share the card. Your browser might not support this feature.',
      });
    }
  }, [card.id, card.name, card.wish, toast]);


  const handleReaction = (reactionType: ReactionType) => {
    if (!currentUserId) return;

    const reactedUsers = card.reactedUserIds?.[reactionType] || [];
    if (reactedUsers.includes(currentUserId)) {
        toast({
            title: "You've already reacted",
            description: `You can only ${reactionType} once.`,
        });
        return;
    }

    const updatedCard = {
      ...card,
      reactions: {
        ...card.reactions,
        [reactionType]: (card.reactions[reactionType] || 0) + 1,
      },
      reactedUserIds: {
        ...(card.reactedUserIds || { love: [], celebration: [] }),
        [reactionType]: [...reactedUsers, currentUserId],
      },
    };
    updateCard(updatedCard);
  };
  
  const backgroundStyle = card.style?.background || 'bg-gradient-pink';

  const hasReactions = card.reactions.love > 0 || card.reactions.celebration > 0;

  return (
    <TooltipProvider>
    <Card
      ref={cardRef}
      className={cn(
        "w-[250px] min-h-[150px] transition-all duration-300 ease-in-out group flex flex-col justify-between",
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
      <div>
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <span>{card.name}</span>
              {!isMobileView && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-grab group-hover:opacity-100 opacity-0 transition-opacity hover:bg-white/20 exclude-from-download"
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
              <Image src={card.imageUrl} alt={card.name} layout="fill" objectFit="cover" objectPosition="top" data-ai-hint="celebration event" />
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
                <Button variant="link" className="p-0 h-auto text-xs mt-2 exclude-from-download" style={{color: card.style.textColor}}>
                  {isExpanded ? 'Read less' : 'Read more'}
                </Button>
              </CollapsibleTrigger>
            )}
          </Collapsible>
          <div className="mt-4 space-y-2 text-xs opacity-80">
            {card.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <a href={`mailto:${card.email}`} className="hover:underline">{card.email}</a>
              </div>
            )}
            {card.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <a href={`tel:${card.phone}`} className="hover:underline">{card.phone}</a>
              </div>
            )}
            {card.whatsapp && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3" />
                <a href={`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{card.whatsapp}</a>
              </div>
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className={cn("flex gap-1 items-center transition-opacity duration-300", !hasReactions && "opacity-0 group-hover:opacity-100")}>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Love" onClick={() => handleReaction('love')} className="flex items-center gap-1 px-2 hover:bg-white/20">
                <Heart className={cn("h-4 w-4", hasLoved && "fill-pink-500 text-pink-500")} /> 
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
                <PartyPopper className={cn("h-4 w-4", hasCelebrated && "fill-yellow-500 text-yellow-500")} />
                <span className="text-xs">{card.reactions.celebration || 0}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Celebrate</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 exclude-from-download">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Share card" onClick={handleShare} className="hover:bg-white/20">
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share</p>
            </TooltipContent>
          </Tooltip>
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <MemoryForm cardData={card} onSave={updateCard} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
          )}
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
