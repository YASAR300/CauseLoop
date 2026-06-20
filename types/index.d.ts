export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  priceId: string;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Score {
  id: string;
  userId: string;
  strokes: number;
  courseName: string;
  datePlayed: Date;
  createdAt: Date;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  logoUrl?: string | null;
  totalRaised: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Draw {
  id: string;
  month: string;
  prizeDescription: string;
  charityId: string;
  status: 'UPCOMING' | 'COMPLETED';
  drawDate: Date;
  createdAt: Date;
}

export interface Winner {
  id: string;
  drawId: string;
  userId: string;
  prizeWon: string;
  announcedAt: Date;
}
