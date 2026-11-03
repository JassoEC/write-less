export interface Message {
  id: string;
  title: string;
  content: string;
  isFavorite: boolean;
  position: number;
  createdAt: number;
  updatedAt: number;
}
