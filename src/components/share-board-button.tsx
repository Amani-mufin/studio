'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Check } from 'lucide-react';
import type { MemoryCardData } from '@/lib/types';

interface ShareBoardButtonProps {
  cards: MemoryCardData[];
}

export function ShareBoardButton({ cards }: ShareBoardButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window === 'undefined') return;

    const boardData = JSON.stringify(cards);
    const encodedData = btoa(boardData);
    const shareUrl = `${window.location.origin}${window.location.pathname}?board=${encodedData}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'You can now share the link to your wish board.',
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy the link to your clipboard.',
      });
    });
  };

  return (
    <Button variant="outline" onClick={handleShare} disabled={copied}>
      {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}
