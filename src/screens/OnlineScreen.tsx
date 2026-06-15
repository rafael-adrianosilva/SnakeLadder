import { useState } from 'react';
import { ArrowLeft, Loader2, Copy, Crown, Check, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useOnlineStore } from '../store/onlineStore';
import Board from '../components/Board';
import PlayerHUD from '../components/PlayerHUD';
import Dice from '../components/Dice';
import type { Player } from '../engine/gameEngine';
import type { OnlineRoom } from '../firebase/online';

function toPlayers(room: OnlineRoom): Player[] {
  return Object.values(room.players)
    .sort((a, b) => a.turnIndex - b.turnIndex)
    .map((p) => ({ id: p.uid, name: p.displayName, color: p.color, position: p.position, isBot: false }));
}

export default function OnlineScreen() {
  const goHome = useGameStore((s) => s.goHome);
  const { status, error, room, nickname, setNickname, create, join, leave } = useOnlineStore();

  const back = () => {
    leave();
    goHome();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 font-sans">
      <header className="w-full max-w-md flex items-center gap-3 mb-6">
        <button onClick={back} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black">Partida Online</h1>
      </header>

      {error && (
        <div className="w-full max-w-md mb-4 px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {status === 'connecting' && (
        <div className="flex items-center gap-2 text-slate-400 mt-10">
          <Loader2 className="w-5 h-5 animate-spin" /> Conectando…
        </div>
      )}

      {(status === 'menu' || (status === 'error' && !room)) && (
        <Menu nickname={nickname} setNickname={setNickname} onCreate={create} onJoin={join} />
      )}

      {status === 'lobby' && room && <Lobby room={room} />}
      {status === 'playing' && room && <OnlineGame room={room} />}
      {status === 'finished' && room && <Result room={room} onLeave={back} />}
    </div>
  );
}

// ─── Menu (nickname + criar/entrar) ────────────────────────────────────────
function Menu({
  nickname,
  setNickname,
  onCreate,
  onJoin,
}: {
  nickname: string;
  setNickname: (s: string) => void;
  onCreate: (n: 2 | 3 | 4) => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(2);
  const ready = nickname.trim().length >= 2;

  return (
    <main className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Seu nome</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          placeholder="Digite seu nome"
          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 outline-none"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-bold text-slate-200">Criar sala</h2>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => setMaxPlayers(n)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold border ${
                maxPlayers === n
                  ? 'bg-indigo-500 border-indigo-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {n} jogadores
            </button>
          ))}
        </div>
        <button
          disabled={!ready}
          onClick={() => onCreate(maxPlayers)}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 disabled:opacity-40"
        >
          Criar sala
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-bold text-slate-200">Entrar com código</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="Ex: XQZT7K"
          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 outline-none tracking-[0.3em] font-mono uppercase"
        />
        <button
          disabled={!ready || code.length < 4}
          onClick={() => onJoin(code)}
          className="w-full py-3 rounded-xl font-bold bg-slate-800 border border-slate-700 hover:border-slate-500 disabled:opacity-40"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}

// ─── Lobby ────────────────────────────────────────────────────────────────
function Lobby({ room }: { room: OnlineRoom }) {
  const { myUid, setReady, start } = useOnlineStore();
  const uid = myUid();
  const players = Object.values(room.players).sort((a, b) => a.turnIndex - b.turnIndex);
  const me = uid ? room.players[uid] : undefined;
  const isCreator = room.createdBy === uid;
  const allReady = players.length >= 2 && players.every((p) => p.isReady);

  return (
    <main className="w-full max-w-md space-y-5">
      <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-5 text-center">
        <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Código da sala</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-4xl font-black font-mono tracking-[0.2em]">{room.roomCode}</span>
          <button
            onClick={() => navigator.clipboard?.writeText(room.roomCode)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
            aria-label="Copiar código"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Compartilhe para os amigos entrarem.</p>
      </div>

      <div className="space-y-2">
        {players.map((p) => (
          <div key={p.uid} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="w-4 h-4 rounded-full border border-white/60" style={{ backgroundColor: p.color }} />
            <span className="font-semibold flex-1">{p.displayName}</span>
            {room.createdBy === p.uid && <Crown className="w-4 h-4 text-yellow-500" />}
            {p.isReady ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" /> Pronto
              </span>
            ) : (
              <span className="text-xs text-slate-500">Aguardando…</span>
            )}
          </div>
        ))}
        {Array.from({ length: room.maxPlayers - players.length }).map((_, i) => (
          <div key={i} className="px-4 py-3 rounded-xl border border-dashed border-slate-700 text-slate-600 text-sm">
            Vaga livre
          </div>
        ))}
      </div>

      <button
        onClick={() => setReady(!me?.isReady)}
        className={`w-full py-3 rounded-xl font-bold border ${
          me?.isReady
            ? 'bg-slate-800 border-slate-700 text-slate-300'
            : 'bg-emerald-500 border-emerald-400 text-white'
        }`}
      >
        {me?.isReady ? 'Cancelar pronto' : 'Estou pronto!'}
      </button>

      {isCreator && (
        <button
          onClick={start}
          disabled={!allReady}
          className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-indigo-500 to-violet-600 disabled:opacity-40"
        >
          {allReady ? 'Iniciar partida' : 'Aguardando todos ficarem prontos'}
        </button>
      )}
    </main>
  );
}

// ─── Jogo online ────────────────────────────────────────────────────────────
function OnlineGame({ room }: { room: OnlineRoom }) {
  const { myUid, roll } = useOnlineStore();
  const uid = myUid();
  const players = toPlayers(room);
  const currentIndex = players.findIndex((p) => p.id === room.currentTurn);
  const isMyTurn = room.currentTurn === uid;
  const current = room.currentTurn ? room.players[room.currentTurn] : null;

  return (
    <div className="w-full max-w-md space-y-4">
      <div
        className="mx-auto px-4 py-1.5 rounded-full text-sm font-bold border w-fit"
        style={{ borderColor: current?.color, color: current?.color }}
      >
        {isMyTurn ? 'Sua vez!' : `Vez de ${current?.displayName ?? '...'}`}
      </div>

      <PlayerHUD players={players} currentIndex={currentIndex < 0 ? 0 : currentIndex} />
      <Board players={players} board={room.board} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-xs text-slate-400">
          {room.lastMove
            ? `${room.players[room.lastMove.playerId]?.displayName} tirou ${room.lastMove.diceResult} → casa ${room.lastMove.to}`
            : 'Lance o dado para jogar.'}
        </div>
        <Dice
          face={room.lastMove?.diceResult ?? 1}
          rolling={false}
          disabled={!isMyTurn}
          onRoll={roll}
          label={isMyTurn ? 'Lançar Dado' : 'Aguarde…'}
        />
      </div>
    </div>
  );
}

// ─── Resultado ────────────────────────────────────────────────────────────
function Result({ room, onLeave }: { room: OnlineRoom; onLeave: () => void }) {
  const winner = room.winner ? room.players[room.winner] : null;
  const ranking = Object.values(room.players).sort((a, b) => b.position - a.position);

  return (
    <main className="w-full max-w-sm flex flex-col items-center gap-6 mt-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl animate-bounce">
        <Trophy className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-black" style={{ color: winner?.color }}>
        {winner?.displayName} venceu!
      </h2>
      <div className="w-full space-y-2">
        {ranking.map((p, i) => (
          <div key={p.uid} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="font-black text-slate-500 w-5">{i + 1}º</span>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="font-semibold flex-1">{p.displayName}</span>
            <span className="text-xs text-slate-400">Casa {p.position}</span>
          </div>
        ))}
      </div>
      <button onClick={onLeave} className="w-full py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700">
        Voltar ao menu
      </button>
    </main>
  );
}
