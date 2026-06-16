/** Bots (seção 6 do prompt). A dificuldade é cosmética; o dado é justo. */
import { rollDice, type Player } from './gameEngine';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BotPreset {
  name: string;
  color: string;
  difficulty: Difficulty;
  thinkingTime: [number, number]; // ms
  emoji: string;
}

export const BOT_PRESETS: BotPreset[] = [
  { name: 'Zilda', color: '#ec4899', difficulty: 'easy', thinkingTime: [500, 1000], emoji: '👵' },
  { name: 'Rex', color: '#f59e0b', difficulty: 'medium', thinkingTime: [800, 1600], emoji: '🐶' },
  { name: 'Cyber-7', color: '#06b6d4', difficulty: 'hard', thinkingTime: [300, 800], emoji: '🤖' },
];

export function botThinkingTime(player: Player): number {
  const preset = BOT_PRESETS.find((b) => b.name === player.name);
  const [min, max] = preset?.thinkingTime ?? [600, 1200];
  return Math.floor(min + Math.random() * (max - min));
}

/**
 * Rola o dado para o bot. Aplica um leve rubber-banding (viés imperceptível)
 * quando o bot está muito atrás, conforme seção 6.2.
 */
export function rollDiceForBot(bot: Player, humanLead: number): number {
  const diff = bot.difficulty ?? 'easy';
  const behind = humanLead > 30;

  let chanceBoost = 0;
  if (behind && diff === 'medium') chanceBoost = 0.15;
  if (behind && diff === 'hard') chanceBoost = 0.25;

  const first = rollDice();
  if (chanceBoost > 0 && Math.random() < chanceBoost) {
    // re-rola e fica com o maior — empurrãozinho sutil
    return Math.max(first, rollDice());
  }
  return first;
}
