export type ReactionType = 'love' | 'celebration';

export interface WishCardData {
  id: string;
  wish: string;
  name: string;
  createdAt: string;
  imageUrl?: string;
  poem?: string;
  position: {
    x: number;
    y: number;
  };
  style: {
    background: string;
    textColor: string;
    fontFamily: string;
    fontSize: number;
  };
  reactions: {
    love: number;
    celebration: number;
  };
}
