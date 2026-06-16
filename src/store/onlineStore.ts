/** Estado do modo online: conexão, sala em tempo real e ações de jogo. */
import { create } from 'zustand';
import type { Unsubscribe } from 'firebase/firestore';
import { auth } from '../firebase/config';
import {
  applyOnlineMove,
  createOnlineRoom,
  ensureAuth,
  joinOnlineRoom,
  leaveOnlineRoom,
  startOnlineGame,
  subscribeRoom,
  toggleReady,
  type OnlineRoom,
} from '../firebase/online';

export type OnlineStatus = 'menu' | 'connecting' | 'lobby' | 'playing' | 'finished' | 'error';

let unsub: Unsubscribe | null = null;

interface OnlineStore {
  status: OnlineStatus;
  nickname: string;
  roomId: string | null;
  room: OnlineRoom | null;
  error: string | null;

  setNickname: (name: string) => void;
  create: (maxPlayers: 2 | 3 | 4) => Promise<void>;
  join: (code: string) => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  start: () => Promise<void>;
  roll: () => Promise<void>;
  leave: () => void;
  reset: () => void;
  myUid: () => string | null;
}

function bind(roomId: string, set: (s: Partial<OnlineStore>) => void, get: () => OnlineStore) {
  if (unsub) unsub();
  unsub = subscribeRoom(roomId, (room) => {
    if (!room) {
      set({ error: 'A sala foi encerrada.', status: 'error' });
      return;
    }
    const status: OnlineStatus =
      room.status === 'in_progress' ? 'playing' : room.status === 'finished' ? 'finished' : 'lobby';
    set({ room, status, error: null });
    void get; // mantém assinatura
  });
}

export const useOnlineStore = create<OnlineStore>((set, get) => ({
  status: 'menu',
  nickname: '',
  roomId: null,
  room: null,
  error: null,

  setNickname: (name) => set({ nickname: name }),
  myUid: () => auth.currentUser?.uid ?? null,

  create: async (maxPlayers) => {
    try {
      set({ status: 'connecting', error: null });
      await ensureAuth();
      const { roomId } = await createOnlineRoom(get().nickname, maxPlayers);
      set({ roomId, status: 'lobby' });
      bind(roomId, set, get);
    } catch (e) {
      set({ status: 'error', error: friendly(e) });
    }
  },

  join: async (code) => {
    try {
      set({ status: 'connecting', error: null });
      await ensureAuth();
      const roomId = await joinOnlineRoom(get().nickname, code);
      set({ roomId, status: 'lobby' });
      bind(roomId, set, get);
    } catch (e) {
      set({ status: 'error', error: friendly(e) });
    }
  },

  setReady: async (ready) => {
    const { roomId } = get();
    const uid = auth.currentUser?.uid;
    if (roomId && uid) await toggleReady(roomId, uid, ready);
  },

  start: async () => {
    const { roomId, room } = get();
    if (roomId && room) {
      try {
        await startOnlineGame(roomId, room);
      } catch (e) {
        set({ error: friendly(e) });
      }
    }
  },

  roll: async () => {
    const { roomId, room } = get();
    const uid = auth.currentUser?.uid;
    if (roomId && room && uid) {
      try {
        await applyOnlineMove(roomId, room, uid);
      } catch (e) {
        set({ error: friendly(e) });
      }
    }
  },

  leave: () => {
    const { roomId, room } = get();
    const uid = auth.currentUser?.uid;
    if (roomId && room && uid) void leaveOnlineRoom(roomId, room, uid);
    if (unsub) unsub();
    unsub = null;
    set({ status: 'menu', roomId: null, room: null, error: null });
  },

  reset: () => {
    if (unsub) unsub();
    unsub = null;
    set({ status: 'menu', roomId: null, room: null, error: null });
  },
}));

function friendly(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes('CONFIGURATION_NOT_FOUND') || msg.includes('configuration-not-found')) {
    return 'Login anônimo ainda não está ativado no Firebase (Authentication → Get Started → Anônimo).';
  }
  if (msg.includes('admin-restricted-operation') || msg.includes('operation-not-allowed')) {
    return 'Ative o provedor "Anônimo" em Authentication no Firebase Console.';
  }
  return msg;
}
