/** Helpers de Firestore: usuários, salas, chat e sincronização em tempo real. */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './config';
import { DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';
import { generateRoomCode } from '../utils/roomCodeGenerator';
import { DEFAULT_AVATAR } from '../types/avatar.types';
import { DEFAULT_PREFERENCES, DEFAULT_STATISTICS, type UserDocument } from '../types/user.types';
import type {
  ChatMessage,
  CreateRoomConfig,
  RoomDocument,
} from '../types/room.types';

// ─── USUÁRIOS ──────────────────────────────────────────────────────────────

/** Cria o documento /users/{uid} caso ainda não exista (primeiro login). */
export async function createUserProfileIfMissing(
  user: User,
  displayName: string,
): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const profile: Omit<UserDocument, 'createdAt' | 'lastSeen' | 'lastOnlinePlayed'> = {
    uid: user.uid,
    displayName: displayName.slice(0, 20),
    email: user.email ?? '',
    coins: 0,
    unlockedItems: [],
    avatarConfig: DEFAULT_AVATAR,
    preferences: DEFAULT_PREFERENCES,
    statistics: DEFAULT_STATISTICS,
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    lastOnlinePlayed: null,
  });
}

export async function getUserProfile(uid: string): Promise<UserDocument | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDocument) : null;
}

/** Atualiza campos não-críticos do usuário (permitido pelas Security Rules). */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserDocument, 'displayName' | 'avatarConfig' | 'preferences'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...data, lastSeen: serverTimestamp() });
}

// ─── SALAS ───────────────────────────────────────────────────────────────

/** Cria uma sala no lobby e retorna o roomId (seção 10.3). */
export async function createRoom(user: User, config: CreateRoomConfig): Promise<string> {
  const roomCode = generateRoomCode();
  const ref = doc(collection(db, 'rooms'));
  const profile = await getUserProfile(user.uid);

  const roomData = {
    roomId: ref.id,
    roomCode,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    status: 'lobby',
    maxPlayers: config.maxPlayers,
    isPrivate: config.isPrivate,
    currentTurn: null,
    turnOrder: [],
    settings: config.settings,
    players: {
      [user.uid]: {
        uid: user.uid,
        displayName: profile?.displayName ?? user.displayName ?? 'Jogador',
        avatarConfig: profile?.avatarConfig ?? DEFAULT_AVATAR,
        position: 0,
        isReady: false,
        isConnected: true,
        lastSeen: serverTimestamp(),
        turnIndex: 0,
        coinsEarned: 0,
      },
    },
    board: DEFAULT_BOARD_CONFIG,
    lastMove: null,
    gameLog: [],
    winner: null,
    finishedAt: null,
  };

  await setDoc(ref, roomData);
  return ref.id;
}

/** Entra em uma sala pelo código, com transação anti-race-condition (seção 10.4). */
export async function joinRoom(user: User, roomCode: string): Promise<string> {
  const q = query(
    collection(db, 'rooms'),
    where('roomCode', '==', roomCode.toUpperCase()),
    where('status', '==', 'lobby'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Sala não encontrada ou já iniciada');

  const roomDoc = snap.docs[0];
  const room = roomDoc.data() as RoomDocument;

  if (room.players[user.uid]) return roomDoc.id; // já está na sala

  const playerCount = Object.keys(room.players).length;
  if (playerCount >= room.maxPlayers) throw new Error('Sala cheia');

  const profile = await getUserProfile(user.uid);

  await runTransaction(db, async (transaction) => {
    const fresh = await transaction.get(roomDoc.ref);
    const freshRoom = fresh.data() as RoomDocument;
    const currentCount = Object.keys(freshRoom.players).length;
    if (currentCount >= freshRoom.maxPlayers) throw new Error('Sala cheia');

    transaction.update(roomDoc.ref, {
      [`players.${user.uid}`]: {
        uid: user.uid,
        displayName: profile?.displayName ?? user.displayName ?? 'Jogador',
        avatarConfig: profile?.avatarConfig ?? DEFAULT_AVATAR,
        position: 0,
        isReady: false,
        isConnected: true,
        lastSeen: serverTimestamp(),
        turnIndex: currentCount,
        coinsEarned: 0,
      },
    });
  });

  return roomDoc.id;
}

/** Marca o jogador como pronto/não-pronto no lobby. */
export async function setPlayerReady(
  roomId: string,
  uid: string,
  isReady: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    [`players.${uid}.isReady`]: isReady,
  });
}

/** Atualiza configurações da sala (apenas o criador, no lobby). */
export async function updateRoomSettings(
  roomId: string,
  settings: RoomDocument['settings'],
): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), { settings });
}

/** Heartbeat de presença durante a partida (campos permitidos pelas rules). */
export async function updatePresence(
  roomId: string,
  uid: string,
  isConnected: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    [`players.${uid}.isConnected`]: isConnected,
    [`players.${uid}.lastSeen`]: serverTimestamp(),
  });
}

/** Escuta a sala em tempo real (seção 8.3). Retorna a função de cancelamento. */
export function subscribeToRoom(
  roomId: string,
  onChange: (room: RoomDocument) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'rooms', roomId),
    (snapshot) => {
      if (snapshot.exists()) onChange(snapshot.data() as RoomDocument);
    },
    (error) => {
      console.error('Erro ao escutar sala:', error);
      onError?.(error);
    },
  );
}

// ─── CHAT ────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  roomId: string,
  message: Pick<ChatMessage, 'authorId' | 'authorName' | 'text' | 'type'>,
): Promise<void> {
  const text = message.text.slice(0, 200).trim();
  if (!text) throw new Error('Mensagem vazia');

  await addDoc(collection(db, 'rooms', roomId, 'messages'), {
    ...message,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToChat(
  roomId: string,
  onChange: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data() as ChatMessage));
  });
}
