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
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: number;
  };
}
