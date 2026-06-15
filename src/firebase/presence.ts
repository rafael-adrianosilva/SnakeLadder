/**
 * Gerenciamento de presença via Realtime Database (seção 8.5).
 * O RTDB é mais adequado que o Firestore para presença por causa do
 * `onDisconnect`, que dispara automaticamente quando o cliente cai.
 */
import { onDisconnect, ref, serverTimestamp, set, onValue, type Unsubscribe } from 'firebase/database';
import { rtdb } from './config';

/** Marca o usuário como online na sala e agenda o offline automático. */
export async function goOnline(roomId: string, userId: string): Promise<void> {
  const presenceRef = ref(rtdb, `presence/${roomId}/${userId}`);

  await onDisconnect(presenceRef).set({
    online: false,
    lastSeen: serverTimestamp(),
  });

  await set(presenceRef, {
    online: true,
    lastSeen: serverTimestamp(),
  });
}

/** Marca explicitamente como offline (ex: sair da sala de propósito). */
export async function goOffline(roomId: string, userId: string): Promise<void> {
  await set(ref(rtdb, `presence/${roomId}/${userId}`), {
    online: false,
    lastSeen: serverTimestamp(),
  });
}

/** Escuta o estado de presença de todos os jogadores de uma sala. */
export function subscribeToPresence(
  roomId: string,
  onChange: (presence: Record<string, { online: boolean; lastSeen: number }>) => void,
): Unsubscribe {
  return onValue(ref(rtdb, `presence/${roomId}`), (snap) => {
    onChange(snap.val() ?? {});
  });
}
