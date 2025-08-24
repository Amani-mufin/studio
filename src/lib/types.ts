
export type ReactionType = 'love' | 'celebration';

export interface MemoryCardData {
  id: string;
  wish: string;
  name: string;
  createdAt: string;
  userId: string; // ID of the user who created the card
  imageUrl?: string;
  poem?: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  position: {
    x: number;
    y: number;
  };
  style: {
    background: string;
    textColor: string;
    fontFamily: string;
  };
  reactions: {
    love: number;
    celebration: number;
  };
  reactedUserIds?: {
    love: string[];
    celebration: string[];
  };
}
