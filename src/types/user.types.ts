/** Modelo da coleção `users` (seção 17.1 do prompt mestre). */
import type { Timestamp } from 'firebase/firestore';
import type { AvatarConfig } from './avatar.types';

export interface UserPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  language: 'pt-BR' | 'en-US';
}

export interface UserStatistics {
  totalMatches: number;
  wins: number;
  totalCoinsEarned: number;
  longestWinStreak: number;
  currentWinStreak: number;
  snakesHit: number;
  laddersClimbed: number;
}

export interface UserDocument {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Timestamp;
  lastSeen: Timestamp;
  lastOnlinePlayed: Timestamp | null;

  coins: number;
  unlockedItems: string[];
  avatarConfig: AvatarConfig;

  preferences: UserPreferences;
  statistics: UserStatistics;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  soundEnabled: true,
  musicEnabled: true,
  hapticEnabled: true,
  animationSpeed: 'normal',
  language: 'pt-BR',
};

export const DEFAULT_STATISTICS: UserStatistics = {
  totalMatches: 0,
  wins: 0,
  totalCoinsEarned: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  snakesHit: 0,
  laddersClimbed: 0,
};
