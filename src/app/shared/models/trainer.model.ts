export interface Trainer {
  id: string;
  userId: string;
  name: string;
  trainerId: string;
  secretId?: string;
  gender?: string;
  game: string;
  createdAt: Date;
}
