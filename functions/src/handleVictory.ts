/**
 * Distribuição de moedas e encerramento da partida (seção 12.3).
 * Roda apenas no servidor (Admin SDK), portanto bypassa as Security Rules —
 * é o único caminho que pode alterar o saldo de moedas dos usuários.
 */
import * as admin from 'firebase-admin';
import { isSameDay } from './boardLogic';

interface CoinDistribution {
  playerId: string;
  coins: number;
  placement: number;
}

const PLACEMENT_COINS = [100, 40, 20, 10];
const DAILY_BONUS = 50;

/** Bônus de streak por vitórias consecutivas (seção 12.2). */
function streakBonus(streak: number): number {
  if (streak >= 10) return 300;
  if (streak >= 5) return 100;
  if (streak >= 3) return 50;
  if (streak >= 2) return 20;
  return 0;
}

export async function handleVictory(roomId: string, winnerId: string): Promise<void> {
  const db = admin.firestore();
  const roomRef = db.doc(`rooms/${roomId}`);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) return;
  const room = roomSnap.data() as FirebaseFirestore.DocumentData;

  // Evita distribuir duas vezes
  if (room.status === 'finished') return;

  const players = Object.values(room.players).sort(
    (a: any, b: any) => b.position - a.position,
  ) as any[];

  const gameLog: any[] = room.gameLog ?? [];
  const coinsDistribution: CoinDistribution[] = [];
  const batch = db.batch();

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    let coins = PLACEMENT_COINS[i] ?? 10;

    // Multiplicador por número de jogadores (4 jogadores = x1.5)
    if (players.length === 4) coins = Math.floor(coins * 1.5);

    // Clean Win: vencedor que não caiu em cobra (x1.3)
    const hitSnake = gameLog.some(
      (e) => e.playerId === player.uid && e.boardEffect === 'snake',
    );
    if (i === 0 && !hitSnake) coins = Math.floor(coins * 1.3);

    // Bônus pela escada maior (28 → 84)
    const climbedBigLadder = gameLog.some(
      (e) => e.playerId === player.uid && e.from === 28 && e.to === 84,
    );
    if (climbedBigLadder) coins += 20;

    const userRef = db.doc(`users/${player.uid}`);
    const userSnap = await userRef.get();
    const userData = userSnap.data() ?? {};

    // Primeira partida do dia (+50)
    const lastPlayed = userData.lastOnlinePlayed?.toDate?.();
    const isFirstToday = !lastPlayed || !isSameDay(lastPlayed, new Date());
    if (isFirstToday) coins += DAILY_BONUS;

    // Streak: o vencedor estende a sequência; os demais zeram
    const isWinner = player.uid === winnerId;
    const prevStreak = userData.statistics?.currentWinStreak ?? 0;
    const newStreak = isWinner ? prevStreak + 1 : 0;
    if (isWinner) coins += streakBonus(newStreak);

    coinsDistribution.push({ playerId: player.uid, coins, placement: i + 1 });

    const longest = Math.max(userData.statistics?.longestWinStreak ?? 0, newStreak);

    batch.set(
      userRef,
      {
        coins: admin.firestore.FieldValue.increment(coins),
        lastOnlinePlayed: admin.firestore.FieldValue.serverTimestamp(),
        statistics: {
          totalMatches: admin.firestore.FieldValue.increment(1),
          wins: admin.firestore.FieldValue.increment(isWinner ? 1 : 0),
          totalCoinsEarned: admin.firestore.FieldValue.increment(coins),
          currentWinStreak: newStreak,
          longestWinStreak: longest,
        },
      },
      { merge: true },
    );

    // Atualiza leaderboard
    batch.set(
      db.doc(`leaderboard/${player.uid}`),
      {
        uid: player.uid,
        displayName: player.displayName,
        avatarConfig: player.avatarConfig,
        wins: admin.firestore.FieldValue.increment(isWinner ? 1 : 0),
        totalMatches: admin.firestore.FieldValue.increment(1),
        totalCoinsEarned: admin.firestore.FieldValue.increment(coins),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  // Histórico da partida
  batch.set(db.doc(`matchHistory/${roomId}`), {
    matchId: roomId,
    roomId,
    playerIds: players.map((p) => p.uid),
    winner: winnerId,
    placement: coinsDistribution,
    duration: durationSeconds(room),
    boardTheme: room.settings?.boardTheme ?? 'classic',
    ruleVariant: room.settings?.ruleVariant ?? 'classic',
    turnCount: gameLog.filter((e) => e.type === 'move').length,
    finishedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Encerra a sala
  batch.update(roomRef, {
    status: 'finished',
    winner: winnerId,
    finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    coinsDistribution,
  });

  await batch.commit();
}

function durationSeconds(room: FirebaseFirestore.DocumentData): number {
  const start = room.createdAt?.toMillis?.() ?? Date.now();
  return Math.round((Date.now() - start) / 1000);
}
