export interface Trainer {
  id: string;
  userId: string;
  name: string;
  trainerId: string;
  game?: string;
  createdAt: Date;
}
