/**
 * Modo online "client-authoritative" com login anônimo (só nickname).
 * O jogador da vez aplica a própria jogada direto no Firestore; os demais
 * recebem via onSnapshot. As Security Rules permitem exatamente esse fluxo.
 */
import { signInAnonymously, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from './config';
import { generateRoomCode } from '../utils/roomCodeGenerator';
import { DEFAULT_BOARD, resolveMove, rollDice } from '../engine/gameEngine';

const PLAYER_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b'];

export interface OnlinePlayer {
  uid: string;
  displayName: string;
  color: string;
  position: number;
  isReady: boolean;
  isConnected: boolean;
  turnIndex: number;
}

export interface OnlineRoom {
  roomId: string;
  roomCode: string;
  createdBy: string;
  status: 'lobby' | 'in_progress' | 'finished';
  maxPlayers: 2 | 3 | 4;
  currentTurn: string | null;
  turnOrder: string[];
  players: Record<string, OnlinePlayer>;
  board: typeof DEFAULT_BOARD;
  lastMove: {
    playerId: string;
    diceResult: number;
    from: number;
    to: number;
    boardEffect: string;
  } | null;
  winner: string | null;
}

/** Garante um usuário (login anônimo) e retorna-o. */
export async function ensureAuth(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

function makePlayer(uid: string, name: string, index: number): OnlinePlayer {
  return {
    uid,
    displayName: name.trim().slice(0, 20) || `Jogador ${index + 1}`,
    color: PLAYER_COLORS[index] ?? PLAYER_COLORS[0],
    position: 0,
    isReady: false,
    isConnected: true,
    turnIndex: index,
  };
}

/** Cria uma sala no lobby e retorna o id + código. */
export async function createOnlineRoom(
  nickname: string,
  maxPlayers: 2 | 3 | 4,
): Promise<{ roomId: string; roomCode: string }> {
  const user = await ensureAuth();
  const ref = doc(collection(db, 'rooms'));
  const roomCode = generateRoomCode();

  await setDoc(ref, {
    roomId: ref.id,
    roomCode,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    status: 'lobby',
    maxPlayers,
    isPrivate: true,
    currentTurn: null,
    turnOrder: [],
    settings: { boardTheme: 'classic', ruleVariant: 'classic', animationSpeed: 'normal' },
    players: { [user.uid]: makePlayer(user.uid, nickname, 0) },
    board: DEFAULT_BOARD,
    lastMove: null,
    gameLog: [],
    winner: null,
    finishedAt: null,
  });

  return { roomId: ref.id, roomCode };
}

/** Entra numa sala pelo código (transação anti-corrida). */
export async function joinOnlineRoom(nickname: string, code: string): Promise<string> {
  const user = await ensureAuth();
  const q = query(
    collection(db, 'rooms'),
    where('roomCode', '==', code.toUpperCase()),
    where('status', '==', 'lobby'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Sala não encontrada ou já iniciada');

  const ref = snap.docs[0].ref;

  await runTransaction(db, async (t) => {
    const fresh = await t.get(ref);
    const room = fresh.data() as OnlineRoom;
    if (room.players[user.uid]) return; // já está na sala
    const count = Object.keys(room.players).length;
    if (count >= room.maxPlayers) throw new Error('Sala cheia');
    t.update(ref, { [`players.${user.uid}`]: makePlayer(user.uid, nickname, count) });
  });

  return ref.id;
}

export function subscribeRoom(roomId: string, cb: (room: OnlineRoom | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'rooms', roomId),
    (s) => cb(s.exists() ? (s.data() as OnlineRoom) : null),
    (err) => {
      console.error('Erro no listener da sala:', err);
      cb(null);
    },
  );
}

export async function toggleReady(roomId: string, uid: string, ready: boolean): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), { [`players.${uid}.isReady`]: ready });
}

/** Inicia a partida (apenas o criador). Sorteia a ordem de turno. */
export async function startOnlineGame(roomId: string, room: OnlineRoom): Promise<void> {
  const order = Object.keys(room.players);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const updates: Record<string, unknown> = {
    status: 'in_progress',
    turnOrder: order,
    currentTurn: order[0],
  };
  order.forEach((uid, idx) => {
    updates[`players.${uid}.turnIndex`] = idx;
    updates[`players.${uid}.position`] = 0;
  });
  await updateDoc(doc(db, 'rooms', roomId), updates);
}

/** Aplica a jogada do jogador da vez. */
export async function applyOnlineMove(roomId: string, room: OnlineRoom, uid: string): Promise<void> {
  if (room.currentTurn !== uid) throw new Error('Não é seu turno');
  const player = room.players[uid];
  const dice = rollDice();
  const result = resolveMove(player.position, dice, room.board);

  const idx = room.turnOrder.indexOf(uid);
  const nextTurn = room.turnOrder[(idx + 1) % room.turnOrder.length];

  const updates: Record<string, unknown> = {
    [`players.${uid}.position`]: result.final,
    currentTurn: result.won ? uid : nextTurn,
    lastMove: {
      playerId: uid,
      diceResult: dice,
      from: player.position,
      to: result.final,
      boardEffect: result.effect,
    },
  };
  if (result.won) {
    updates.winner = uid;
    updates.status = 'finished';
    updates.finishedAt = serverTimestamp();
  }
  await updateDoc(doc(db, 'rooms', roomId), updates);
}

/** Sai da sala (remove o próprio jogador se ainda no lobby). */
export async function leaveOnlineRoom(roomId: string, room: OnlineRoom, uid: string): Promise<void> {
  if (room.status !== 'lobby') return;
  const players = { ...room.players };
  delete players[uid];
  if (Object.keys(players).length === 0) return; // deixa a sala órfã; cleanup cuida
  await updateDoc(doc(db, 'rooms', roomId), { players });
}
