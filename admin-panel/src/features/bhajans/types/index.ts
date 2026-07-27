import { Timestamp } from 'firebase/firestore';

export interface BhajanDTO {
  id?: string;
  title: string;
  description?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  lyrics?: string;
  createdAt?: Timestamp | Date;
}

export interface BhajanViewModel {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  thumbnailUrl: string;
  lyrics?: string;
  createdAt?: Date;
}
