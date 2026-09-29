/**
 * ECTV 前端共用型別（原創設計層，不依賴上游 UI）
 */

export interface MediaItem {
  id: string;
  title: string;
  poster: string;
  rate?: string;
  year?: string;
}

export interface HeroItem {
  id: string;
  title: string;
  backdrop: string;
  poster: string;
  overview: string;
  rating: number;
  year: string;
  genres: string[];
}
