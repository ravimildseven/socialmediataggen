import { SparklesIcon } from "./components/icons";

export enum Platform {
  Facebook = 'facebook',
  Instagram = 'instagram',
  YouTube = 'youtube',
}

export type PopularityCategory = 'Viral' | 'High' | 'Medium' | 'Niche';

export interface TagWithCategory {
  tag: string;
  category: PopularityCategory;
}

export type TagResults = Partial<Record<Platform, TagWithCategory[]>>;