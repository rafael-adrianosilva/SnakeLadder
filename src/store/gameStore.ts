/** Estado global do jogo (telas + partida local/bot) com animações. */
import { create } from 'zustand';
import {
  DEFAULT_BOARD,
  resolveMove,
  rollDice,
  type BoardConfig,
  type BoardEffect,
  type Player,
  type RuleVariant,
} from '../engine/gameEngine';
import { BOT_PRESETS, botThinkingTime, rollDiceForBot } from '../engine/botAI';

export type Screen = 'home' | 'setup' | 'game' | 'victory' | 'board3d' | 'online';
export type GameMode = 'bot' | 'local';
export type Phase = 'idle' | 'rolling' | 'moving';

const PLAYER_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b'];
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface SetupConfig {
  mode: GameMode;
  /** Nomes dos jogadores humanos (modo local). */
  humanNames: string[];
  /** Quantidade de bots (modo bot). */
  botCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameStore {
  screen: Screen;
  mode: GameMode | null;
  players: Player[];
  currentIndex: number;
  board: BoardConfig;
  variant: RuleVariant;
  dice: number | null;
  diceFace: number; // valor mostrado durante a animação
  phase: Phase;
  lastEffect: BoardEffect | null;
  winner: Player | null;
  log: string[];
  toast: string | null;

  goHome: () => void;
  openSetup: (mode: GameMode) => void;
  viewBoard3D: () => void;
  openOnline: () => void;
  showToast: (msg: string) => void;
  dismissToast: () => void;
  startGame: (config: SetupConfig) => void;
  requestRoll: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  /** Executa um turno completo (animação do dado + movimento + efeitos). */
  async function playTurn(diceValue: number) {
    const { players, currentIndex, board, variant } = get();
    const player = players[currentIndex];

    // Animação do dado
    set({ phase: 'rolling' });
    for (let i = 0; i < 10; i++) {
      set({ diceFace: Math.floor(Math.random() * 6) + 1 });
      await sleep(60);
    }
    set({ dice: diceValue, diceFace: diceValue });
    await sleep(300);

    // Movimento casa a casa
    set({ phase: 'moving' });
    const result = resolveMove(player.position, diceValue, board, variant);

    if (result.path.length === 0) {
      get().showToast(`${player.name} tirou ${diceValue} e passou de 100 — não move.`);
    }

    for (const step of result.path) {
      setPlayerPosition(player.id, step);
      await sleep(160);
    }

    // Efeito de cobra/escada
    if (result.effect !== 'none') {
      await sleep(350);
      setPlayerPosition(player.id, result.final);
      set({ lastEffect: result.effect });
      const verb = result.effect === 'ladder' ? 'subiu por uma escada 🪜' : 'caiu numa cobra 🐍';
      pushLog(`${player.name} ${verb} (${result.landed} → ${result.final}).`);
      await sleep(500);
      set({ lastEffect: null });
    } else if (result.path.length > 0) {
      pushLog(`${player.name} foi para a casa ${result.final}.`);
    }

    // Vitória
    if (result.won) {
      set({ winner: player, screen: 'victory', phase: 'idle' });
      return;
    }

    // Próximo turno
    const next = (currentIndex + 1) % players.length;
    set({ currentIndex: next, phase: 'idle', dice: null });
    maybeRunBot();
  }

  function setPlayerPosition(id: string, position: number) {
    set((s) => ({
      players: s.players.map((p) => (p.id === id ? { ...p, position } : p)),
    }));
  }

  function pushLog(entry: string) {
    set((s) => ({ log: [entry, ...s.log].slice(0, 30) }));
  }

  /** Se o jogador da vez é um bot, joga automaticamente. */
  function maybeRunBot() {
    const { players, currentIndex, winner } = get();
    if (winner) return;
    const player = players[currentIndex];
    if (!player.isBot) return;

    const humanMax = Math.max(...players.filter((p) => !p.isBot).map((p) => p.position), 0);
    const lead = humanMax - player.position;

    setTimeout(() => {
      void playTurn(rollDiceForBot(player, lead));
    }, botThinkingTime(player));
  }

  return {
    screen: 'home',
    mode: null,
    players: [],
    currentIndex: 0,
    board: DEFAULT_BOARD,
    variant: 'classic',
    dice: null,
    diceFace: 1,
    phase: 'idle',
    lastEffect: null,
    winner: null,
    log: [],
    toast: null,

    goHome: () =>
      set({ screen: 'home', players: [], winner: null, log: [], dice: null, phase: 'idle' }),

    openSetup: (mode) => set({ screen: 'setup', mode }),

    viewBoard3D: () => set({ screen: 'board3d' }),

    openOnline: () => set({ screen: 'online' }),

    showToast: (msg) => {
      set({ toast: msg });
      setTimeout(() => {
        if (get().toast === msg) set({ toast: null });
      }, 2600);
    },

    dismissToast: () => set({ toast: null }),

    startGame: (config) => {
      const players: Player[] = [];

      if (config.mode === 'local') {
        config.humanNames.forEach((name, i) => {
          players.push({
            id: `p${i}`,
            name: name.trim() || `Jogador ${i + 1}`,
            color: PLAYER_COLORS[i],
            position: 0,
            isBot: false,
          });
        });
      } else {
        players.push({
          id: 'p0',
          name: 'Você',
          color: PLAYER_COLORS[0],
          position: 0,
          isBot: false,
        });
        for (let i = 0; i < config.botCount; i++) {
          const preset = BOT_PRESETS[i % BOT_PRESETS.length];
          players.push({
            id: `bot${i}`,
            name: preset.name,
            color: preset.color,
            position: 0,
            isBot: true,
            difficulty: config.difficulty,
          });
        }
      }

      set({
        screen: 'game',
        players,
        currentIndex: 0,
        dice: null,
        diceFace: 1,
        phase: 'idle',
        lastEffect: null,
        winner: null,
        log: [`Partida iniciada com ${players.length} jogadores.`],
      });

      // Caso o primeiro a jogar seja bot (não acontece, humano é sempre p0).
      maybeRunBot();
    },

    requestRoll: () => {
      const { phase, players, currentIndex, winner } = get();
      if (phase !== 'idle' || winner) return;
      if (players[currentIndex].isBot) return; // bots jogam sozinhos
      void playTurn(rollDice());
    },
  };
});
