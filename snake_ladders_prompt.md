# PROMPT MESTRE — JOGO COBRINHAS & ESCADAS (SNAKE & LADDERS)
> Documento de contexto completo para desenvolvimento full-stack do jogo, cobrindo arquitetura, modos de jogo, bots, multiplayer online (Firebase), customização de personagens e sistema de moedas. Use este documento como referência absoluta ao longo de todo o desenvolvimento.

---

## ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura Geral do Sistema](#3-arquitetura-geral-do-sistema)
4. [Regras e Mecânicas do Jogo](#4-regras-e-mecânicas-do-jogo)
5. [Estrutura do Tabuleiro](#5-estrutura-do-tabuleiro)
6. [Modo Single Player — Contra Bots](#6-modo-single-player--contra-bots)
7. [Modo Local (Multiplayer Offline)](#7-modo-local-multiplayer-offline)
8. [Modo Online com Firebase](#8-modo-online-com-firebase)
9. [Regras do Firebase (Firestore Security Rules)](#9-regras-do-firebase-firestore-security-rules)
10. [Sistema de Salas Online](#10-sistema-de-salas-online)
11. [Customização de Personagens](#11-customização-de-personagens)
12. [Sistema de Moedas](#12-sistema-de-moedas)
13. [Interface do Usuário (UI/UX)](#13-interface-do-usuário-uiux)
14. [Animações e Efeitos Visuais](#14-animações-e-efeitos-visuais)
15. [Gerenciamento de Estado](#15-gerenciamento-de-estado)
16. [Estrutura de Pastas do Projeto](#16-estrutura-de-pastas-do-projeto)
17. [Modelos de Dados (Schemas)](#17-modelos-de-dados-schemas)
18. [Fluxos de Tela (Screen Flows)](#18-fluxos-de-tela-screen-flows)
19. [Sons e Feedback Audiovisual](#19-sons-e-feedback-audiovisual)
20. [Acessibilidade e Responsividade](#20-acessibilidade-e-responsividade)
21. [Considerações de Segurança](#21-considerações-de-segurança)
22. [Cronograma Sugerido de Desenvolvimento](#22-cronograma-sugerido-de-desenvolvimento)

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Descrição

Este projeto é uma versão digital e moderna do clássico jogo de tabuleiro **Snake & Ladders** (Cobrinhas e Escadas), com múltiplos modos de jogo, customização visual de personagens e sistema de recompensas em partidas online.

O objetivo principal do jogo é ser o primeiro jogador a chegar à casa 100 do tabuleiro, avançando de acordo com o resultado de um dado e sendo afetado por cobrinhas (que fazem o jogador descer) e escadas (que fazem o jogador subir).

### 1.2 Pilares do Projeto

- **Divertimento imediato:** partidas rápidas (5–15 minutos), fáceis de aprender.
- **Três modos de jogo:** contra bots, local com amigos no mesmo dispositivo, e online em tempo real.
- **Identidade visual:** estilo moderno e colorido, com tabuleiro e peças animadas.
- **Customização:** o jogador pode montar seu próprio boneco/avatar com partes intercambiáveis.
- **Engajamento online:** sistema de moedas que recompensa vitórias em partidas online.

### 1.3 Público-Alvo

- Faixa etária: 8–40 anos.
- Jogadores casuais que conhecem o jogo físico e querem uma versão digital.
- Grupos de amigos que querem jogar juntos remotamente.
- Jogadores solo que querem desafio contra bots com diferentes dificuldades.

### 1.4 Plataforma Inicial

- Web (React ou Vue.js), responsiva para desktop e mobile.
- Firebase como backend para autenticação, banco de dados em tempo real e regras de segurança.

---

## 2. STACK TECNOLÓGICA

### 2.1 Frontend

```
Framework:     React 18+ (com TypeScript)
Gerenciador:   Vite (bundler rápido)
Estilo:        Tailwind CSS + CSS Modules para componentes específicos
Animação:      Framer Motion (movimentos de peças, dados) + GSAP (animações de cobrinhas/escadas)
Estado:        Zustand (estado global leve) ou Redux Toolkit (se preferir mais estrutura)
Roteamento:    React Router v6
Áudio:         Howler.js (sons do jogo)
Ícones/SVG:    Lucide React + SVGs customizados para o tabuleiro
```

### 2.2 Backend / Infraestrutura

```
Banco de dados em tempo real:   Firebase Firestore
Autenticação:                   Firebase Authentication (email/senha + Google OAuth)
Hospedagem:                     Firebase Hosting
Funções serverless:             Firebase Cloud Functions (Node.js 18+)
Armazenamento de assets:        Firebase Storage (avatares, imagens de peças)
Regras de segurança:            Firestore Security Rules + Storage Rules
```

### 2.3 Ferramentas de Desenvolvimento

```
Lint:         ESLint + Prettier
Testes:       Vitest (unitários) + Playwright (e2e)
CI/CD:        GitHub Actions → Firebase Hosting
Versionamento: Git (GitHub)
```

---

## 3. ARQUITETURA GERAL DO SISTEMA

### 3.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENTE (React)                         │
│                                                                   │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────────────────┐ │
│  │  UI Layer  │  │  Game Engine  │  │     State Management      │ │
│  │  (React)   │  │  (TypeScript) │  │  (Zustand / Redux)        │ │
│  └───────────┘  └───────────────┘  └──────────────────────────┘ │
│         │               │                        │               │
│         └───────────────┴────────────────────────┘               │
│                                │                                  │
└────────────────────────────────┼──────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       Firebase SDK       │
                    │  (Firestore Realtime +   │
                    │   Auth + Storage)        │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                       │
   ┌──────▼──────┐      ┌────────▼────────┐    ┌────────▼────────┐
   │  Firestore   │      │  Firebase Auth  │    │ Cloud Functions  │
   │  (Salas,     │      │  (Identidade)   │    │ (Lógica crítica  │
   │   Usuários,  │      └─────────────────┘    │  no servidor)    │
   │   Moedas)    │                              └─────────────────┘
   └─────────────┘
```

### 3.2 Separação de Responsabilidades

| Camada | Responsabilidade |
|--------|------------------|
| UI Layer | Renderização do tabuleiro, peças, dados, menus |
| Game Engine | Lógica pura do jogo (movimento, cobrinhas, escadas, turno) |
| State Management | Estado local, sincronização com Firestore |
| Firebase Firestore | Persistência e sincronização em tempo real entre jogadores |
| Cloud Functions | Validação de jogadas (anti-cheat), distribuição de moedas |

### 3.3 Princípio de Game Authority

Em partidas **online**, o servidor (Cloud Functions) é a autoridade final. O cliente envia a intenção ("quero jogar o dado") e o servidor valida, executa e retorna o novo estado. Isso previne trapaças.

Em partidas **locais e contra bots**, o cliente é a autoridade — não há necessidade de servidor.

---

## 4. REGRAS E MECÂNICAS DO JOGO

### 4.1 Regras Clássicas

1. O tabuleiro possui **100 casas** numeradas de 1 a 100.
2. Cada jogador começa **fora do tabuleiro** (posição 0).
3. A cada turno, o jogador lança **1 dado de 6 faces**.
4. O jogador avança o número de casas indicado pelo dado.
5. Se o jogador chegar exatamente em uma **casa com base de escada**, ele sobe até o topo.
6. Se o jogador chegar exatamente em uma **casa com cabeça de cobra**, ele desce até a cauda.
7. Para **vencer**, o jogador precisa atingir **exatamente a casa 100**.
   - Se o resultado do dado ultrapassar 100, o jogador **não se move** naquele turno.
   - Variante opcional: se ultrapassar, o jogador volta o excesso (ex: estava em 98, tirou 4 → vai para 100, depois volta 2, ficando em 98... na verdade este é um caso especial descrito abaixo).
8. A ordem dos jogadores é determinada por um sorteio inicial (cada um lança o dado, quem tirar maior começa).

### 4.2 Variante de Regras (Configurável)

| Regra | Padrão | Variante |
|-------|--------|---------|
| Ultrapassar 100 | Não move | Volta o excesso |
| Cobra na posição 99 | Sim (clássico) | Pode ser desativado |
| Número mínimo de jogadores | 2 | 2 |
| Número máximo de jogadores | 4 | 4 |
| Turno duplo no 6 | Não | Pode ser ativado |

Se "turno duplo no 6" estiver ativado: ao tirar 6, o jogador avança e lança o dado novamente. Se tirar 6 três vezes seguidas, perde o turno (regra anti-loop).

### 4.3 Cobrinhas e Escadas — Posições Padrão

O tabuleiro padrão usa as seguintes posições (pode ser customizado em versões futuras):

**Escadas (base → topo):**
```
4  → 14
9  → 31
20 → 38
28 → 84
40 → 59
51 → 67
63 → 81
71 → 91
```

**Cobrinhas (cabeça → cauda):**
```
17 → 7
54 → 34
62 → 19
64 → 60
87 → 24
93 → 73
95 → 75
99 → 78
```

### 4.4 Fluxo de um Turno

```
1. [Aguardar turno do jogador]
       ↓
2. [Jogador pressiona "Lançar Dado"]
       ↓
3. [Animação do dado girando]
       ↓
4. [Resultado do dado exibido]
       ↓
5. [Calcular nova posição]
   → Se nova posição > 100: não mover (ou voltar excesso conforme configuração)
   → Se nova posição = 100: VITÓRIA
   → Se nova posição ≤ 100: mover peça
       ↓
6. [Animação da peça se movendo casa a casa]
       ↓
7. [Verificar se caiu em cobra ou escada]
   → Se cobra: animação de descida, novo som
   → Se escada: animação de subida, novo som
       ↓
8. [Verificar vitória]
   → Se posição = 100: tela de vitória
   → Se não: passar turno para próximo jogador
       ↓
9. [Repetir a partir do passo 1 para o próximo jogador]
```

---

## 5. ESTRUTURA DO TABULEIRO

### 5.1 Layout do Tabuleiro 10×10

O tabuleiro é uma grade 10×10 com numeração em **serpentina** (boustrophedon):
- Linha 1 (baixo): casas 1–10, da esquerda para a direita.
- Linha 2: casas 11–20, da direita para a esquerda.
- Linha 3: casas 21–30, da esquerda para a direita.
- E assim por diante...

```
100 99  98  97  96  95  94  93  92  91
81  82  83  84  85  86  87  88  89  90
80  79  78  77  76  75  74  73  72  71
61  62  63  64  65  66  67  68  69  70
60  59  58  57  56  55  54  53  52  51
41  42  43  44  45  46  47  48  49  50
40  39  38  37  36  35  34  33  32  31
21  22  23  24  25  26  27  28  29  30
20  19  18  17  16  15  14  13  12  11
 1   2   3   4   5   6   7   8   9  10
```

### 5.2 Coordenadas das Casas

Cada casa `n` (1 a 100) deve ser convertida para coordenadas `(col, row)` no grid:
```typescript
function getCellCoordinates(n: number): { col: number; row: number } {
  const row = Math.floor((n - 1) / 10);        // linha de baixo para cima (0 = base)
  const col = row % 2 === 0
    ? (n - 1) % 10                              // linha par: esquerda → direita
    : 9 - (n - 1) % 10;                         // linha ímpar: direita → esquerda
  return { col, row };
}
```

### 5.3 Renderização do Tabuleiro

- O tabuleiro é renderizado como um grid CSS 10×10 ou via Canvas 2D.
- Cada célula exibe seu número.
- Cobrinhas e escadas são desenhadas como SVGs ou canvas paths conectando as células correspondentes.
- As peças dos jogadores são posicionadas sobre as células usando posicionamento absoluto calculado a partir de `getCellCoordinates`.

### 5.4 Temas Visuais do Tabuleiro

O jogo deve suportar ao menos 3 temas de tabuleiro:

| Tema | Descrição |
|------|-----------|
| **Clássico** | Cores vibrantes, estilo board game tradicional |
| **Floresta** | Verde, marrom, tons naturais, cobrinhas realistas |
| **Espacial** | Azul escuro, roxo, estrelas, cobrinhas alienígenas |

Os temas afetam: cores das células, estilo das cobrinhas/escadas, cor do dado e sons de fundo.

---

## 6. MODO SINGLE PLAYER — CONTRA BOTS

### 6.1 Visão Geral

O modo contra bots permite ao jogador humano enfrentar de 1 a 3 oponentes controlados pelo computador. Não há conexão com Firebase neste modo — tudo roda localmente no cliente.

### 6.2 Dificuldades dos Bots

Os bots no Snake & Ladders classicamente não têm controle sobre o dado, pois é um jogo de pura sorte. A "dificuldade" dos bots, portanto, é implementada de forma **ilusória mas divertida**, usando técnicas de rubber-banding e viés no dado:

#### Fácil (Easy Bot)
- O bot não tem vantagem estatística.
- O dado é completamente aleatório (Math.random * 6 + 1).
- O bot pensa por 0.5–1.0s antes de jogar (simula um humano casual).
- Frequentemente "comemora" subidas de escadas com animações exageradas.
- Nunca usa estratégias agressivas.

#### Médio (Medium Bot)
- O dado tem um leve viés positivo para o bot quando ele está muito atrás do jogador humano (rubber-banding suave).
- Implementação: se o bot está mais de 30 casas atrás, há 15% de chance de rolar um número mais alto.
- O bot pensa por 1.0–2.0s.
- Reage a cobrinhas com "raiva" e a escadas com "alegria" (expressões no avatar).

#### Difícil (Hard Bot)
- O dado tem um viés mais agressivo: quando o bot está atrás, tem 25% de chance de um dado favorável.
- Quando o bot está na liderança e próximo de 100, tem 20% de chance de evitar casas com cobrinhas críticas.
- O bot pensa por 0.3–0.8s (mais rápido, mais confiante).
- Pode desafiar o humano com animações provocativas.

> **Nota importante:** Esses vieses devem ser aplicados de forma **imperceptível e não exibida ao jogador**. A experiência deve parecer natural. Os vieses são ferramentas de balanceamento de diversão (game feel), não trapaça explícita.

### 6.3 Personalidade dos Bots

Cada bot tem uma personalidade visual e de nome pré-definida:

```typescript
interface BotPersonality {
  id: string;
  name: string;
  avatarPreset: AvatarConfig;   // avatar pré-configurado
  difficulty: 'easy' | 'medium' | 'hard';
  reactionSet: 'happy' | 'grumpy' | 'calm' | 'chaotic';
  thinkingTime: [min: number, max: number]; // ms
  catchphrases: string[];        // frases exibidas em balões de fala
}
```

**Bots pré-definidos:**
- **Zilda (Fácil):** vovó animada, sempre feliz, reage a tudo com exclamações.
- **Rex (Médio):** cachorro competitivo, late quando perde.
- **Cyber-7 (Difícil):** robô frio, sem emoções, comentários irônicos.
- **Pimenta (Médio):** criança travessa, imprevisível, emoji-heavy.

### 6.4 Loop de Jogo do Bot

```typescript
async function botTurn(bot: Bot, gameState: GameState): Promise<void> {
  // 1. Exibir indicador de "pensando..."
  showThinkingIndicator(bot.id);

  // 2. Esperar o tempo de "pensamento" do bot
  await sleep(randomBetween(bot.personality.thinkingTime[0], bot.personality.thinkingTime[1]));

  // 3. Calcular resultado do dado (com possível viés)
  const diceResult = rollDiceForBot(bot, gameState);

  // 4. Animar o dado
  await animateDice(diceResult);

  // 5. Calcular nova posição
  const newPosition = calculateNewPosition(bot.position, diceResult, gameState.board);

  // 6. Verificar se cobra/escada se aplica
  const finalPosition = applyBoardEffects(newPosition, gameState.board);

  // 7. Animar movimento
  await animatePieceMovement(bot.id, bot.position, finalPosition);

  // 8. Exibir reação do bot
  showBotReaction(bot, bot.position, finalPosition);

  // 9. Atualizar estado
  updateBotPosition(bot.id, finalPosition);

  // 10. Verificar vitória
  if (finalPosition === 100) {
    triggerBotVictory(bot);
    return;
  }

  // 11. Passar o turno
  nextTurn(gameState);
}
```

### 6.5 Configuração da Partida Contra Bots

Tela de configuração com os seguintes parâmetros:
- Número de bots: 1, 2 ou 3.
- Dificuldade: individual por bot ou global.
- Variante de regras: padrão ou com turno duplo no 6.
- Tema do tabuleiro.
- Velocidade de animação: lenta, normal, rápida.

---

## 7. MODO LOCAL (MULTIPLAYER OFFLINE)

### 7.1 Visão Geral

O modo local permite que 2 a 4 jogadores humanos joguem no **mesmo dispositivo**, passando o celular/computador entre si a cada turno. Não há conexão com Firebase neste modo.

### 7.2 Configuração dos Jogadores Locais

Antes de iniciar a partida, cada jogador:
1. Digita seu nome.
2. Escolhe a cor da peça (ou avatar, se já desbloqueado).
3. A ordem de jogada é definida por sorteio (cada jogador lança o dado, maior começa).

### 7.3 Indicação de Turno

- A tela exibe claramente **de quem é o turno atual** no topo.
- Um banner/modal aparece ao mudar de turno: "Agora é a vez de **[Nome]** – passe o celular!"
- O botão de lançar dado só aparece/funciona após o jogador confirmar que pegou o dispositivo.

### 7.4 Fluxo de Passagem de Turno

```
[Fim do turno do Jogador A]
         ↓
[Modal: "Passe o dispositivo para [Nome do Jogador B]"]
         ↓
[Jogador B clica em "Estou pronto!"]
         ↓
[Tela do Jogador B aparece]
         ↓
[Botão "Lançar Dado" disponível]
```

### 7.5 Pausa e Retomada Local

- O jogo pode ser pausado a qualquer momento.
- O estado é salvo no `localStorage` com uma chave única por partida.
- Ao reabrir o app, se houver uma partida salva, o jogador pode continuar.
- A partida local salva: posições de todos os jogadores, turno atual, histórico de jogadas.

### 7.6 Diferenças do Modo Local vs Bots

| Aspecto | Bots | Local |
|---------|------|-------|
| Controle do oponente | Computador | Humano |
| Velocidade | Automática | Manual |
| Personalidade | Programada | Natural |
| Passagem de dispositivo | Não necessária | Necessária |
| Salvar progresso | LocalStorage | LocalStorage |
| Sistema de moedas | Não | Não |

---

## 8. MODO ONLINE COM FIREBASE

### 8.1 Visão Geral

O modo online permite que jogadores em dispositivos diferentes joguem em tempo real, usando o Firebase Firestore como camada de sincronização. O Firebase Realtime Database ou Firestore com `onSnapshot` é a base para atualizações em tempo real.

### 8.2 Arquitetura do Modo Online

```
Jogador A (Cliente React)            Jogador B (Cliente React)
       │                                      │
       │  Jogador A lança o dado              │
       │  → Envia jogada para Firestore       │
       │                                      │
       ▼                                      │
  Firestore (Sala de Jogo)                    │
  /rooms/{roomId}/currentTurn                 │
  /rooms/{roomId}/players/{playerId}          │
  /rooms/{roomId}/gameLog[]                   │
       │                                      │
       │     onSnapshot dispara              ◄─┘
       │     → Jogador B recebe atualização
       │     → Tela do Jogador B atualiza
       ▼
  Cloud Function (Validação)
  → Verifica se a jogada é legítima
  → Calcula resultado
  → Atualiza Firestore com novo estado
```

### 8.3 Uso de `onSnapshot` para Sincronização

```typescript
// Escutar mudanças na sala em tempo real
const unsubscribe = onSnapshot(
  doc(db, 'rooms', roomId),
  (snapshot) => {
    const roomData = snapshot.data() as RoomDocument;
    updateLocalGameState(roomData);
  },
  (error) => {
    console.error('Erro ao escutar sala:', error);
    handleConnectionError(error);
  }
);

// Limpar listener ao sair da sala
onUnmount(() => unsubscribe());
```

### 8.4 Proteção contra Lag e Desconexão

- **Heartbeat:** cada cliente envia um timestamp a cada 5s para `/rooms/{roomId}/players/{playerId}/lastSeen`.
- **Timeout:** se um jogador não atualizar o heartbeat por 15s, ele é marcado como "desconectado".
- **Reconexão:** ao reconectar, o cliente busca o estado atual da sala e sincroniza.
- **Abandono:** se o jogador desconectar por mais de 60s, a sala pode ser finalizada ou o turno pode ser passado automaticamente.

### 8.5 Gerenciamento de Presença com Firebase

```typescript
// Usando Firebase Realtime Database para presença (mais adequado que Firestore)
import { getDatabase, ref, onDisconnect, set, serverTimestamp } from 'firebase/database';

const db = getDatabase();
const presenceRef = ref(db, `presence/${roomId}/${userId}`);

// Ao conectar: marcar como online
await set(presenceRef, {
  online: true,
  lastSeen: serverTimestamp()
});

// Ao desconectar (automático pelo Firebase):
onDisconnect(presenceRef).set({
  online: false,
  lastSeen: serverTimestamp()
});
```

### 8.6 Validação de Jogadas via Cloud Function

```typescript
// Cloud Function: validateMove
export const validateMove = functions.https.onCall(async (data, context) => {
  // 1. Verificar autenticação
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login necessário');

  const { roomId, playerId, diceResult } = data;

  // 2. Buscar estado atual da sala
  const roomRef = admin.firestore().doc(`rooms/${roomId}`);
  const roomSnap = await roomRef.get();
  const room = roomSnap.data();

  // 3. Verificar se é o turno do jogador
  if (room.currentTurn !== playerId) {
    throw new functions.https.HttpsError('permission-denied', 'Não é seu turno');
  }

  // 4. Verificar se o resultado do dado é válido (1–6)
  if (diceResult < 1 || diceResult > 6 || !Number.isInteger(diceResult)) {
    throw new functions.https.HttpsError('invalid-argument', 'Dado inválido');
  }

  // 5. Calcular nova posição no servidor
  const player = room.players[playerId];
  const newPosition = calculatePosition(player.position, diceResult, room.board);

  // 6. Atualizar estado da sala no Firestore
  await roomRef.update({
    [`players.${playerId}.position`]: newPosition,
    currentTurn: getNextPlayer(room),
    lastMove: {
      playerId,
      diceResult,
      from: player.position,
      to: newPosition,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    gameLog: admin.firestore.FieldValue.arrayUnion({
      type: 'move',
      playerId,
      diceResult,
      from: player.position,
      to: newPosition,
      timestamp: Date.now()
    })
  });

  // 7. Verificar vitória e distribuir moedas
  if (newPosition === 100) {
    await handleVictory(roomId, playerId, room);
  }

  return { success: true, newPosition };
});
```

---

## 9. REGRAS DO FIREBASE (FIRESTORE SECURITY RULES)

### 9.1 Princípios Fundamentais

As regras do Firestore devem garantir:
1. **Autenticação obrigatória** para qualquer escrita.
2. **Apenas o jogador do turno atual** pode submeter uma jogada.
3. **Apenas o criador da sala** pode modificar configurações da sala.
4. **Jogadores só podem editar seus próprios dados** (posição, avatar).
5. **Leitura da sala é pública** para os membros da sala.
6. **Moedas só podem ser alteradas pelo servidor** (Cloud Functions com Admin SDK).

### 9.2 Regras Completas do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── HELPER FUNCTIONS ─────────────────────────────────────────────────

    // Verifica se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Verifica se o usuário é o dono do documento
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Verifica se o usuário é membro de uma sala
    function isRoomMember(roomData) {
      return request.auth.uid in roomData.players;
    }

    // Verifica se o usuário é o criador da sala
    function isRoomCreator(roomData) {
      return request.auth.uid == roomData.createdBy;
    }

    // Verifica se é o turno do usuário
    function isCurrentTurn(roomData) {
      return request.auth.uid == roomData.currentTurn;
    }

    // Verifica se a sala ainda está no lobby (não iniciou)
    function isRoomInLobby(roomData) {
      return roomData.status == 'lobby';
    }

    // Verifica se a sala está em andamento
    function isRoomInProgress(roomData) {
      return roomData.status == 'in_progress';
    }

    // Valida estrutura de um jogador
    function isValidPlayerUpdate() {
      let allowed = ['displayName', 'avatarConfig', 'isReady'];
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(allowed);
    }

    // ─── USUÁRIOS ─────────────────────────────────────────────────────────

    match /users/{userId} {
      // Leitura: apenas o próprio usuário
      allow read: if isAuthenticated() && isOwner(userId);

      // Criação: autenticado, apenas o próprio usuário
      allow create: if isAuthenticated() && isOwner(userId)
                    && request.resource.data.coins >= 0
                    && request.resource.data.displayName is string
                    && request.resource.data.displayName.size() >= 2
                    && request.resource.data.displayName.size() <= 20;

      // Atualização: o usuário pode editar apenas campos não-críticos
      // Moedas só podem ser alteradas pelo servidor (Admin SDK bypass)
      allow update: if isAuthenticated() && isOwner(userId)
                    && request.resource.data.diff(resource.data)
                       .affectedKeys()
                       .hasOnly(['displayName', 'avatarConfig', 'lastSeen',
                                 'preferences', 'statistics']);

      // Deleção: não permitida pelo cliente
      allow delete: if false;
    }

    // ─── SALAS DE JOGO ────────────────────────────────────────────────────

    match /rooms/{roomId} {
      // Leitura: qualquer membro da sala
      allow read: if isAuthenticated()
                  && isRoomMember(resource.data);

      // Criação: usuário autenticado pode criar uma sala
      allow create: if isAuthenticated()
                    && request.resource.data.createdBy == request.auth.uid
                    && request.resource.data.status == 'lobby'
                    && request.resource.data.maxPlayers in [2, 3, 4]
                    && request.resource.data.players[request.auth.uid] != null;

      // Atualização geral: apenas membros da sala
      allow update: if isAuthenticated()
                    && isRoomMember(resource.data)
                    && validateRoomUpdate();

      // Deleção: apenas o criador, e apenas se a sala estiver no lobby
      allow delete: if isAuthenticated()
                    && isRoomCreator(resource.data)
                    && isRoomInLobby(resource.data);

      // Validação de atualização da sala
      function validateRoomUpdate() {
        let currentData = resource.data;
        let newData = request.resource.data;
        let changedKeys = newData.diff(currentData).affectedKeys();

        // O criador pode mudar configurações no lobby
        if (isRoomCreator(currentData) && isRoomInLobby(currentData)) {
          return changedKeys.hasOnly(['settings', 'status', 'players']);
        }

        // Qualquer membro pode marcar-se como pronto no lobby
        if (isRoomInLobby(currentData)) {
          return changedKeys.hasOnly(['players'])
                 && onlyOwnPlayerChanged(currentData, newData);
        }

        // Durante o jogo: apenas o Cloud Function (Admin SDK) pode alterar
        // (as regras do cliente não permitem mudanças em in_progress exceto presença)
        if (isRoomInProgress(currentData)) {
          return changedKeys.hasOnly(['players'])
                 && onlyPresenceChanged(currentData, newData);
        }

        return false;
      }

      // Verifica se apenas o próprio jogador foi alterado
      function onlyOwnPlayerChanged(currentData, newData) {
        return request.auth.uid in newData.players
               && request.auth.uid in currentData.players;
      }

      // Verifica se apenas campos de presença foram alterados
      function onlyPresenceChanged(currentData, newData) {
        let uid = request.auth.uid;
        return newData.players[uid].diff(currentData.players[uid])
               .affectedKeys()
               .hasOnly(['lastSeen', 'isConnected']);
      }
    }

    // ─── CHAT DA SALA ─────────────────────────────────────────────────────

    match /rooms/{roomId}/messages/{messageId} {
      // Leitura: membros da sala
      allow read: if isAuthenticated()
                  && isRoomMember(get(/databases/$(database)/documents/rooms/$(roomId)).data);

      // Escrita: membros da sala, com validação de conteúdo
      allow create: if isAuthenticated()
                    && isRoomMember(get(/databases/$(database)/documents/rooms/$(roomId)).data)
                    && request.resource.data.authorId == request.auth.uid
                    && request.resource.data.text is string
                    && request.resource.data.text.size() > 0
                    && request.resource.data.text.size() <= 200
                    && request.resource.data.type in ['text', 'emoji', 'system'];

      // Mensagens não podem ser editadas ou deletadas por clientes
      allow update, delete: if false;
    }

    // ─── HISTÓRICO DE PARTIDAS ────────────────────────────────────────────

    match /matchHistory/{matchId} {
      // Leitura: qualquer usuário autenticado que participou
      allow read: if isAuthenticated()
                  && request.auth.uid in resource.data.playerIds;

      // Criação e edição: apenas servidor (Cloud Functions)
      allow write: if false;
    }

    // ─── LEADERBOARD ──────────────────────────────────────────────────────

    match /leaderboard/{entry} {
      // Leitura: qualquer usuário autenticado
      allow read: if isAuthenticated();

      // Escrita: apenas servidor
      allow write: if false;
    }

    // ─── CONFIGURAÇÕES GLOBAIS (READ-ONLY para clientes) ──────────────────

    match /config/{document} {
      allow read: if true;
      allow write: if false;
    }

    // ─── DENY ALL (regra padrão de bloqueio) ──────────────────────────────

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 9.3 Regras do Firebase Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Avatares dos usuários
    match /avatars/{userId}/{fileName} {
      // Leitura pública (avatares podem ser vistos por todos)
      allow read: if true;

      // Escrita: apenas o próprio usuário, com validação de tipo e tamanho
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024  // máx 2MB
                   && request.resource.contentType.matches('image/.*');

      // Deleção: apenas o próprio usuário
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // Assets do jogo (read-only para clientes)
    match /game-assets/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Bloquear tudo mais
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 10. SISTEMA DE SALAS ONLINE

### 10.1 Estados de uma Sala

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  lobby  │────►│  countdown  │────►│ in_progress  │────►│ finished │
└─────────┘     └─────────────┘     └─────────────┘     └──────────┘
     │                                      │
     │                              ┌───────▼────────┐
     └──────────────────────────────│   abandoned    │
                                    └────────────────┘
```

| Status | Descrição |
|--------|-----------|
| `lobby` | Sala criada, aguardando jogadores. Configurações podem ser alteradas. |
| `countdown` | Todos marcaram ready, contagem regressiva de 3s antes de iniciar. |
| `in_progress` | Jogo em andamento. |
| `finished` | Jogo encerrado com vencedor definido. |
| `abandoned` | Todos os jogadores desconectaram. |

### 10.2 Documento da Sala no Firestore

```typescript
interface RoomDocument {
  roomId: string;
  roomCode: string;           // código de 6 letras para entrar (ex: "XQZT7K")
  createdBy: string;          // uid do criador
  createdAt: Timestamp;
  status: RoomStatus;
  maxPlayers: 2 | 3 | 4;
  isPrivate: boolean;         // sala privada (apenas com código) ou pública
  currentTurn: string;        // uid do jogador atual
  turnOrder: string[];        // ordem dos jogadores

  settings: {
    boardTheme: 'classic' | 'forest' | 'space';
    ruleVariant: 'classic' | 'bounce' | 'double6';
    animationSpeed: 'slow' | 'normal' | 'fast';
  };

  players: {
    [uid: string]: PlayerInRoom;
  };

  board: {
    snakes: { [head: number]: number };    // cabeça → cauda
    ladders: { [base: number]: number };  // base → topo
  };

  lastMove: LastMove | null;
  gameLog: GameLogEntry[];
  winner: string | null;
  finishedAt: Timestamp | null;
}

interface PlayerInRoom {
  uid: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  position: number;           // 0 = fora do tabuleiro, 100 = venceu
  isReady: boolean;
  isConnected: boolean;
  lastSeen: Timestamp;
  turnIndex: number;          // índice na ordem de jogada
  coinsEarned: number;        // moedas ganhas nesta partida
}

interface LastMove {
  playerId: string;
  diceResult: number;
  from: number;
  to: number;
  boardEffect: 'snake' | 'ladder' | 'none';
  timestamp: Timestamp;
}
```

### 10.3 Criação de Sala

```typescript
async function createRoom(config: CreateRoomConfig): Promise<string> {
  const roomCode = generateRoomCode();  // gera código de 6 caracteres
  const roomId = nanoid();

  const roomData: RoomDocument = {
    roomId,
    roomCode,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    status: 'lobby',
    maxPlayers: config.maxPlayers,
    isPrivate: config.isPrivate,
    currentTurn: null,
    turnOrder: [],
    settings: config.settings,
    players: {
      [auth.currentUser.uid]: {
        uid: auth.currentUser.uid,
        displayName: currentUser.displayName,
        avatarConfig: currentUser.avatarConfig,
        position: 0,
        isReady: false,
        isConnected: true,
        lastSeen: serverTimestamp(),
        turnIndex: 0,
        coinsEarned: 0
      }
    },
    board: DEFAULT_BOARD_CONFIG,
    lastMove: null,
    gameLog: [],
    winner: null,
    finishedAt: null
  };

  await setDoc(doc(db, 'rooms', roomId), roomData);
  return roomId;
}
```

### 10.4 Entrar em uma Sala

```typescript
async function joinRoom(roomCode: string): Promise<string> {
  // 1. Buscar sala pelo código
  const q = query(collection(db, 'rooms'),
    where('roomCode', '==', roomCode.toUpperCase()),
    where('status', '==', 'lobby')
  );
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('Sala não encontrada ou já iniciada');

  const roomDoc = snap.docs[0];
  const room = roomDoc.data() as RoomDocument;

  // 2. Verificar se há vagas
  const playerCount = Object.keys(room.players).length;
  if (playerCount >= room.maxPlayers) throw new Error('Sala cheia');

  // 3. Verificar se o jogador já está na sala
  if (room.players[auth.currentUser.uid]) {
    return roomDoc.id; // já está na sala, apenas retornar
  }

  // 4. Adicionar jogador à sala (transação para evitar race condition)
  await runTransaction(db, async (transaction) => {
    const freshRoomSnap = await transaction.get(roomDoc.ref);
    const freshRoom = freshRoomSnap.data() as RoomDocument;

    const currentCount = Object.keys(freshRoom.players).length;
    if (currentCount >= freshRoom.maxPlayers) throw new Error('Sala cheia');

    transaction.update(roomDoc.ref, {
      [`players.${auth.currentUser.uid}`]: {
        uid: auth.currentUser.uid,
        displayName: currentUser.displayName,
        avatarConfig: currentUser.avatarConfig,
        position: 0,
        isReady: false,
        isConnected: true,
        lastSeen: serverTimestamp(),
        turnIndex: currentCount,
        coinsEarned: 0
      }
    });
  });

  return roomDoc.id;
}
```

### 10.5 Chat na Sala

Durante o lobby e durante a partida, há um chat lateral com:
- Mensagens de texto curtas (máx 200 caracteres).
- Emojis rápidos (botões de reação: 👍 😂 😱 🎉 😤).
- Mensagens do sistema (ex: "Jogador X entrou na sala", "Fulano subiu pela escada!").

---

## 11. CUSTOMIZAÇÃO DE PERSONAGENS

### 11.1 Visão Geral

Cada jogador pode montar seu próprio avatar a partir de partes intercambiáveis. O sistema funciona como um editor visual de personagem, com partes desbloqueáveis via moedas ou conquistas.

### 11.2 Estrutura do Avatar

O avatar é composto por camadas sobrepostas (como um sistema de "paper doll"):

```
┌──────────────────────────────────────────────────┐
│                   AVATAR LAYERS                   │
│                                                   │
│  Camada 7: Acessório (chapéu, óculos, etc.)      │
│  Camada 6: Expressão Facial (olhos, boca)        │
│  Camada 5: Cabelo                                │
│  Camada 4: Corpo / Roupa                        │
│  Camada 3: Base do Corpo (forma/cor da pele)    │
│  Camada 2: Cor de Fundo do Avatar               │
│  Camada 1: Forma da Peça (círculo, estrela...)  │
└──────────────────────────────────────────────────┘
```

### 11.3 Estrutura de Dados do Avatar

```typescript
interface AvatarConfig {
  pieceShape: 'circle' | 'star' | 'diamond' | 'square' | 'hexagon';
  backgroundColor: string;       // hex color
  bodyBase: BodyBaseId;          // id da base do corpo
  bodyColor: string;             // hex color
  outfit: OutfitId | null;       // id da roupa
  hair: HairId | null;           // id do cabelo
  hairColor: string;             // hex color
  eyes: EyesId;                  // id dos olhos
  mouth: MouthId;                // id da boca
  accessory: AccessoryId | null; // id do acessório
  frameEffect: FrameEffect;      // efeito de frame/borda da peça
}

type BodyBaseId = 'human_m' | 'human_f' | 'robot' | 'alien' | 'ghost' | 'cat' | 'dog';
type HairId = 'short' | 'long' | 'curly' | 'mohawk' | 'bald' | 'ponytail' | ...;
type EyesId = 'normal' | 'happy' | 'cool' | 'angry' | 'star' | 'heart' | ...;
type MouthId = 'smile' | 'grin' | 'surprised' | 'serious' | 'tongue' | ...;
type AccessoryId = 'tophat' | 'cap' | 'crown' | 'glasses' | 'monocle' | 'flower' | ...;
type OutfitId = 'tshirt' | 'suit' | 'astronaut' | 'ninja' | 'wizard' | ...;
type FrameEffect = 'none' | 'glow' | 'fire' | 'ice' | 'lightning' | 'rainbow';
```

### 11.4 Itens Desbloqueáveis

Cada item tem um custo em moedas ou um requisito de conquista:

```typescript
interface AvatarItem {
  id: string;
  category: 'body' | 'hair' | 'eyes' | 'mouth' | 'outfit' | 'accessory' | 'frame' | 'shape';
  name: string;
  previewAsset: string;          // URL da imagem de prévia
  svgAsset: string;              // SVG do item
  unlockType: 'free' | 'coins' | 'achievement' | 'level';
  cost?: number;                 // custo em moedas (se unlockType = 'coins')
  achievementId?: string;        // id da conquista requerida
  requiredLevel?: number;        // nível requerido
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

**Exemplos de itens e custos:**

| Item | Raridade | Custo |
|------|----------|-------|
| Camiseta básica | Common | Grátis |
| Óculos escuros | Common | 50 moedas |
| Chapéu de mago | Rare | 150 moedas |
| Armadura de cavaleiro | Epic | 400 moedas |
| Coroa de ouro | Legendary | 1000 moedas |
| Frame "Fire" | Rare | 200 moedas |
| Body "Robô" | Rare | 300 moedas |
| Acessório "Asas de Anjo" | Epic | 500 moedas |

Itens de achievement (grátis mas requerem conquista):
- "Capelo de Formatura" → jogar 10 partidas online.
- "Máscara de Halloween" → jogar em 31 de outubro.
- "Chapéu de Papai Noel" → jogar em dezembro.

### 11.5 Editor de Avatar (UI)

O editor deve ter:
- **Prévia ao vivo** do avatar no centro da tela.
- **Tabs de categoria** (Corpo, Cabelo, Olhos, Boca, Roupa, Acessório, Frame).
- **Grid de itens** com ícones e indicação de desbloqueado/bloqueado.
- **Paleta de cores** para cabelo, corpo e cor de fundo (color picker).
- **Botão de Randomizar** (gera um avatar aleatório com itens desbloqueados).
- **Botão de Salvar** (persiste no Firestore e localStorage).
- Indicação de quantas moedas o usuário tem (para comprar itens bloqueados).

### 11.6 Renderização do Avatar no Jogo

O avatar é renderizado no tabuleiro como uma peça de escala reduzida (30×30px quando no tabuleiro). Em múltiplos jogadores na mesma casa, os avatares ficam agrupados com leve offset.

Animações do avatar:
- **Idle:** leve balanço suave.
- **Movendo:** pulo de casa em casa.
- **Subindo escada:** animação de subida com trail de estrelas.
- **Descendo cobra:** animação de queda com expressão triste.
- **Vitória:** confete + avatar pulando.
- **Derrota:** avatar abaixando a cabeça.

---

## 12. SISTEMA DE MOEDAS

### 12.1 Visão Geral

O sistema de moedas é exclusivo para partidas **online**. Moedas são ganhas ao vencer ou participar de partidas, e gastas na customização de avatares.

### 12.2 Moedas Ganhas por Partida Online

As moedas são distribuídas pela Cloud Function `handleVictory` ao final de cada partida online:

| Resultado | Moedas Base |
|-----------|-------------|
| 1º lugar (vitória) | 100 moedas |
| 2º lugar | 40 moedas |
| 3º lugar | 20 moedas |
| 4º lugar | 10 moedas |
| Participação (desconectou) | 5 moedas |

**Bônus multiplicadores:**
| Condição | Multiplicador |
|----------|---------------|
| Partida com 4 jogadores | x1.5 |
| Vitória sem cair em cobra | x1.3 ("Clean Win") |
| Subiu pela escada maior (pos 28→84) | +20 moedas bônus |
| Vitória sendo o único a cair em cobra | +30 moedas bônus ("Resilience") |
| Primeira partida do dia | +50 moedas bônus |

**Streak bonus (vitórias consecutivas):**
| Vitórias seguidas | Bônus |
|-------------------|-------|
| 2 em sequência | +20 moedas |
| 3 em sequência | +50 moedas |
| 5 em sequência | +100 moedas |
| 10 em sequência | +300 moedas |

### 12.3 Distribuição de Moedas (Cloud Function)

```typescript
export const handleVictory = async (
  roomId: string,
  winnerId: string,
  room: RoomDocument
): Promise<void> => {
  const db = admin.firestore();
  const batch = db.batch();

  // Ordenar jogadores por posição final
  const players = Object.values(room.players).sort((a, b) => b.position - a.position);

  const coinsDistribution: CoinDistribution[] = [];
  const placementCoins = [100, 40, 20, 10];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    let coins = placementCoins[i] || 10;

    // Multiplicador por número de jogadores
    if (players.length === 4) coins = Math.floor(coins * 1.5);

    // Bônus Clean Win
    const playerLog = room.gameLog.filter(e => e.playerId === player.uid);
    const hitSnake = playerLog.some(e => e.boardEffect === 'snake');
    if (i === 0 && !hitSnake) coins = Math.floor(coins * 1.3);

    // Bônus primeira partida do dia
    const userRef = db.doc(`users/${player.uid}`);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const lastPlayed = userData?.lastOnlinePlayed?.toDate();
    const isFirstToday = !lastPlayed || !isSameDay(lastPlayed, new Date());
    if (isFirstToday) coins += 50;

    // Registrar distribuição
    coinsDistribution.push({ playerId: player.uid, coins, placement: i + 1 });

    // Atualizar moedas e estatísticas do usuário
    batch.update(userRef, {
      coins: admin.firestore.FieldValue.increment(coins),
      lastOnlinePlayed: admin.firestore.FieldValue.serverTimestamp(),
      'statistics.totalMatches': admin.firestore.FieldValue.increment(1),
      'statistics.wins': admin.firestore.FieldValue.increment(i === 0 ? 1 : 0)
    });
  }

  // Salvar resultado da partida
  const matchRef = db.collection('matchHistory').doc(roomId);
  batch.set(matchRef, {
    roomId,
    players: players.map(p => p.uid),
    winner: winnerId,
    placement: coinsDistribution,
    duration: calculateMatchDuration(room),
    finishedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Atualizar sala como finalizada
  const roomRef = db.doc(`rooms/${roomId}`);
  batch.update(roomRef, {
    status: 'finished',
    winner: winnerId,
    finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    coinsDistribution
  });

  await batch.commit();
};
```

### 12.4 Compra de Itens com Moedas

A compra de itens acontece via Cloud Function para garantir que o saldo não seja manipulado:

```typescript
export const purchaseItem = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login necessário');

  const { itemId } = data;
  const uid = context.auth.uid;
  const db = admin.firestore();

  // Buscar item
  const itemSnap = await db.doc(`config/items`).get();
  const items = itemSnap.data().items as AvatarItem[];
  const item = items.find(i => i.id === itemId);

  if (!item) throw new functions.https.HttpsError('not-found', 'Item não encontrado');
  if (item.unlockType !== 'coins') throw new functions.https.HttpsError('invalid-argument', 'Item não comprável com moedas');

  // Transação para debitar moedas e adicionar item
  await db.runTransaction(async (t) => {
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await t.get(userRef);
    const user = userSnap.data();

    if (user.coins < item.cost) {
      throw new functions.https.HttpsError('resource-exhausted', 'Moedas insuficientes');
    }

    if (user.unlockedItems?.includes(itemId)) {
      throw new functions.https.HttpsError('already-exists', 'Item já desbloqueado');
    }

    t.update(userRef, {
      coins: admin.firestore.FieldValue.increment(-item.cost),
      unlockedItems: admin.firestore.FieldValue.arrayUnion(itemId)
    });
  });

  return { success: true, itemId };
});
```

### 12.5 Exibição de Moedas na Interface

- **Cabeçalho do app:** sempre exibe o saldo de moedas com ícone de moeda dourada.
- **Após partida online:** tela de resultados com animação de moedas chegando (+X moedas).
- **Loja de itens:** cada item exibe o custo; itens com moedas insuficientes ficam em destaque com lock icon.
- **Histórico de ganhos:** na tela de perfil, o usuário pode ver as últimas 20 transações de moedas.

---

## 13. INTERFACE DO USUÁRIO (UI/UX)

### 13.1 Telas Principais

```
TELAS DO APP:

1. Splash / Loading Screen
2. Tela de Login / Cadastro
3. Menu Principal (Home)
4. Seleção de Modo de Jogo
5. Configuração de Partida (Bots / Local)
6. Lobby Online (criar / entrar em sala)
7. Sala Online (aguardando jogadores)
8. Tela de Jogo (tabuleiro)
9. Tela de Resultados / Fim de Partida
10. Perfil do Usuário
11. Editor de Avatar
12. Loja de Itens
13. Leaderboard Online
14. Configurações do App
```

### 13.2 Design Visual

**Paleta de Cores Principal:**
```
Primária:        #6C3FF5  (roxo vibrante)
Secundária:      #FF6B35  (laranja quente)
Sucesso:         #2ECC71  (verde esmeralda)
Perigo:          #E74C3C  (vermelho)
Moeda:           #F1C40F  (amarelo dourado)
Background dark: #1A1A2E  (azul escuro profundo)
Background card: #16213E  (azul escuro médio)
Surface:         #0F3460  (azul escuro claro)
Texto primário:  #EAEAEA
Texto secundário:#A0AEC0
```

**Tipografia:**
```
Display (títulos grandes):  "Fredoka One" – arredondado, lúdico
UI (botões, labels):        "Nunito" – legível, amigável
Dados/números:              "Space Grotesk" – moderno, técnico
```

### 13.3 Componentes de UI Principais

**BoardCell (casa do tabuleiro):**
```tsx
interface BoardCellProps {
  number: number;
  hasSnakeHead?: boolean;    // se há cabeça de cobra nesta casa
  hasSnakeTail?: boolean;    // se há cauda de cobra
  hasLadderBase?: boolean;   // se há base de escada
  hasLadderTop?: boolean;    // se há topo de escada
  players?: PlayerInRoom[];  // jogadores nesta casa
  isHighlighted?: boolean;   // casa destacada (última jogada)
}
```

**DiceButton:**
- Tamanho grande, fácil de tocar no mobile.
- Exibe o valor do dado com animação de rolagem.
- Bloqueado durante o turno dos outros jogadores.
- Vibração háptica no mobile ao ser pressionado (navigator.vibrate).

**PlayerHUD:**
- Exibe: avatar, nome, posição atual, indicador de turno.
- Aparece como um card para cada jogador na lateral ou parte inferior da tela.

### 13.4 Responsividade

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Tabuleiro ocupa 100% da tela; HUDs abaixo/acima |
| Tablet (640–1024px) | Tabuleiro + HUDs laterais |
| Desktop (> 1024px) | Tabuleiro central + HUDs laterais + chat |

O tabuleiro deve ser sempre **quadrado** e ocupar o máximo de espaço disponível mantendo a proporção.

---

## 14. ANIMAÇÕES E EFEITOS VISUAIS

### 14.1 Animação do Dado

```typescript
const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅'];

async function animateDice(result: number): Promise<void> {
  // 1. Mostrar faces aleatórias por 800ms (simulação de rolagem)
  for (let i = 0; i < 10; i++) {
    showDiceFace(Math.floor(Math.random() * 6) + 1);
    await sleep(80);
  }
  // 2. Mostrar desaceleração nos últimos frames
  for (let i = 0; i < 5; i++) {
    showDiceFace(Math.floor(Math.random() * 6) + 1);
    await sleep(120 + i * 30);
  }
  // 3. Mostrar resultado final com bounce
  showDiceFace(result);
  playSound('dice_land');
  triggerHaptics('medium');
}
```

### 14.2 Animação de Movimento da Peça

A peça se move **casa a casa**, não diretamente da posição inicial para a final:

```typescript
async function animatePieceMovement(
  playerId: string,
  from: number,
  to: number
): Promise<void> {
  const steps = getMovementPath(from, to);  // array de posições intermediárias

  for (const step of steps) {
    movePieceToCell(playerId, step);
    await sleep(ANIMATION_SPEEDS[currentSpeed]);  // 100–300ms por casa
    playSound('piece_step');
  }
}
```

### 14.3 Animação de Cobra (Descida)

```typescript
async function animateSnake(playerId: string, from: number, to: number): Promise<void> {
  // 1. Exibir efeito de destaque na cobra
  highlightSnake(from, to);

  // 2. Mostrar expressão triste no avatar
  setAvatarExpression(playerId, 'sad');

  // 3. Animar descida pela cobra (caminho curvo via SVG)
  await animateAlongSnakePath(playerId, from, to);

  // 4. Som e partículas de queda
  playSound('snake_hiss');
  spawnParticles(getCellCoordinates(to), 'fall');

  // 5. Restaurar expressão neutra
  await sleep(500);
  setAvatarExpression(playerId, 'neutral');
}
```

### 14.4 Animação de Escada (Subida)

```typescript
async function animateLadder(playerId: string, from: number, to: number): Promise<void> {
  // 1. Exibir efeito de destaque na escada
  highlightLadder(from, to);

  // 2. Mostrar expressão animada no avatar
  setAvatarExpression(playerId, 'happy');

  // 3. Animar subida pela escada (caminho diagonal)
  await animateAlongLadderPath(playerId, from, to);

  // 4. Som e partículas de celebração
  playSound('ladder_climb');
  spawnParticles(getCellCoordinates(to), 'stars');

  // 5. Efeito de frame glow
  triggerFrameEffect(playerId, 'sparkle');
}
```

### 14.5 Tela de Vitória

- Confetes em cascata com as cores do jogador vencedor.
- Avatar do vencedor em tamanho grande com animação de dança.
- Pontuação de moedas ganhas aparecendo com contador numérico animado.
- Ranking dos jogadores em cards que "chegam" na tela com spring animation.
- Botões: "Jogar Novamente", "Voltar ao Menu", "Ver Perfil".

---

## 15. GERENCIAMENTO DE ESTADO

### 15.1 Estrutura do Estado Global (Zustand)

```typescript
interface GameStore {
  // ── Estado do Usuário ──
  currentUser: UserProfile | null;
  isAuthenticated: boolean;

  // ── Estado da Partida ──
  gameMode: 'bot' | 'local' | 'online' | null;
  gameState: GameState | null;
  roomId: string | null;

  // ── Estado da UI ──
  isLoading: boolean;
  currentScreen: ScreenName;
  toast: ToastMessage | null;

  // ── Ações ──
  setUser: (user: UserProfile | null) => void;
  setGameState: (state: GameState) => void;
  rollDice: () => Promise<void>;
  endTurn: () => void;
  leaveGame: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
}
```

### 15.2 GameState (Estado do Jogo)

```typescript
interface GameState {
  players: Player[];
  currentTurnIndex: number;
  board: BoardConfig;
  status: 'waiting' | 'rolling' | 'moving' | 'finished';
  winner: Player | null;
  turnCount: number;
  gameLog: GameLogEntry[];
  settings: GameSettings;
}
```

### 15.3 Sincronização Online

Para o modo online, o estado local é derivado do Firestore:
1. O `onSnapshot` listener atualiza um "estado remoto" no store.
2. Um seletor derivado (`useGameState`) mescla o estado remoto com animações locais pendentes.
3. Animações locais sempre rodam antes de mostrar o novo estado remoto.

---

## 16. ESTRUTURA DE PASTAS DO PROJETO

```
snake-ladders/
├── public/
│   ├── sounds/
│   │   ├── dice_roll.mp3
│   │   ├── dice_land.mp3
│   │   ├── piece_step.mp3
│   │   ├── snake_hiss.mp3
│   │   ├── ladder_climb.mp3
│   │   ├── victory.mp3
│   │   ├── defeat.mp3
│   │   └── background_music.mp3
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   ├── avatars/
│   │   │   ├── bodies/
│   │   │   ├── hair/
│   │   │   ├── eyes/
│   │   │   ├── mouths/
│   │   │   ├── outfits/
│   │   │   └── accessories/
│   │   ├── board/
│   │   │   ├── classic/
│   │   │   ├── forest/
│   │   │   └── space/
│   │   └── ui/
│   │
│   ├── components/
│   │   ├── board/
│   │   │   ├── Board.tsx
│   │   │   ├── BoardCell.tsx
│   │   │   ├── Snake.tsx
│   │   │   ├── Ladder.tsx
│   │   │   └── PlayerPiece.tsx
│   │   ├── game/
│   │   │   ├── Dice.tsx
│   │   │   ├── PlayerHUD.tsx
│   │   │   ├── TurnBanner.tsx
│   │   │   ├── GameLog.tsx
│   │   │   └── VictoryScreen.tsx
│   │   ├── avatar/
│   │   │   ├── AvatarRenderer.tsx
│   │   │   ├── AvatarEditor.tsx
│   │   │   └── AvatarItemGrid.tsx
│   │   ├── online/
│   │   │   ├── Lobby.tsx
│   │   │   ├── RoomChat.tsx
│   │   │   ├── PlayerReadyList.tsx
│   │   │   └── ConnectionStatus.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── CoinDisplay.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── engine/
│   │   ├── gameEngine.ts          # lógica pura do jogo
│   │   ├── boardConfig.ts         # config de cobras/escadas
│   │   ├── diceRoller.ts          # rolagem de dado + viés dos bots
│   │   ├── botAI.ts               # IA dos bots
│   │   └── animations.ts          # helpers de animação
│   │
│   ├── firebase/
│   │   ├── config.ts              # inicialização Firebase
│   │   ├── auth.ts                # helpers de autenticação
│   │   ├── firestore.ts           # helpers de Firestore
│   │   ├── storage.ts             # helpers de Storage
│   │   └── functions.ts           # chamadas para Cloud Functions
│   │
│   ├── hooks/
│   │   ├── useGameEngine.ts
│   │   ├── useOnlineRoom.ts
│   │   ├── useAvatarEditor.ts
│   │   ├── useCoins.ts
│   │   └── useSound.ts
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── OnlineLobbyScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AvatarEditorScreen.tsx
│   │   ├── ShopScreen.tsx
│   │   └── LeaderboardScreen.tsx
│   │
│   ├── store/
│   │   ├── gameStore.ts
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── game.types.ts
│   │   ├── user.types.ts
│   │   ├── room.types.ts
│   │   └── avatar.types.ts
│   │
│   ├── utils/
│   │   ├── boardUtils.ts
│   │   ├── roomCodeGenerator.ts
│   │   ├── formatters.ts
│   │   └── dateUtils.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── functions/                     # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── validateMove.ts
│   │   ├── handleVictory.ts
│   │   ├── purchaseItem.ts
│   │   └── cleanupRooms.ts
│   └── package.json
│
├── firestore.rules
├── storage.rules
├── firebase.json
├── .firebaserc
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 17. MODELOS DE DADOS (SCHEMAS)

### 17.1 Coleção `users`

```typescript
// /users/{uid}
interface UserDocument {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Timestamp;
  lastSeen: Timestamp;
  lastOnlinePlayed: Timestamp | null;

  coins: number;                     // saldo atual de moedas
  unlockedItems: string[];           // ids dos itens desbloqueados
  avatarConfig: AvatarConfig;        // configuração atual do avatar

  preferences: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    hapticEnabled: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
    language: 'pt-BR' | 'en-US';
  };

  statistics: {
    totalMatches: number;
    wins: number;
    totalCoinsEarned: number;
    longestWinStreak: number;
    currentWinStreak: number;
    snakesHit: number;
    laddersClimbed: number;
  };
}
```

### 17.2 Coleção `rooms`

Ver seção 10.2.

### 17.3 Coleção `matchHistory`

```typescript
// /matchHistory/{matchId}
interface MatchHistoryDocument {
  matchId: string;
  roomId: string;
  playerIds: string[];
  winner: string;                // uid do vencedor
  placement: CoinDistribution[]; // classificação e moedas
  duration: number;              // duração em segundos
  boardTheme: string;
  ruleVariant: string;
  finishedAt: Timestamp;
  turnCount: number;
}
```

### 17.4 Coleção `leaderboard`

```typescript
// /leaderboard/{uid}
interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  wins: number;
  totalMatches: number;
  winRate: number;               // calculado pela Cloud Function
  totalCoinsEarned: number;
  updatedAt: Timestamp;
}
```

---

## 18. FLUXOS DE TELA (SCREEN FLOWS)

### 18.1 Fluxo Completo do App

```
[SPLASH SCREEN]
      ↓
[Verificar auth]
      ├──(não autenticado)──→ [LOGIN / CADASTRO]
      │                              ↓
      └──(autenticado)──────→ [HOME / MENU PRINCIPAL]
                                     │
             ┌───────────────────────┼──────────────────────┐
             │                       │                       │
        [BOTS]                  [LOCAL]               [ONLINE]
             │                       │                       │
    [Config. partida]      [Config. jogadores]    [Lobby Menu]
             │                       │               │       │
        [Tabuleiro]            [Tabuleiro]    [Criar sala] [Entrar sala]
             │                       │               │           │
    [Resultado/Fim]          [Resultado/Fim]   [Sala Online (lobby)]
                                                       │
                                               [Tabuleiro Online]
                                                       │
                                               [Resultado + Moedas]
```

### 18.2 Fluxo de Criação de Conta

```
[Tela de Login]
→ Email + Senha → [Verificação] → [Editor de Avatar (primeira vez)] → [Home]
→ Google OAuth  → [Verificação] → [Editor de Avatar (primeira vez)] → [Home]
→ "Jogar sem conta" (modo guest) → [Home] (sem acesso ao modo online)
```

### 18.3 Fluxo de Sala Online

```
[Lobby Menu]
     │
     ├── [CRIAR SALA]
     │       ↓
     │   [Configurar sala] (privada/pública, nº jogadores, tema)
     │       ↓
     │   [Sala criada] → Exibe código da sala
     │       ↓
     │   [Aguardando jogadores]
     │       ↓ (todos marcaram ready)
     │   [Countdown 3, 2, 1...]
     │       ↓
     │   [Jogo inicia]
     │
     └── [ENTRAR NA SALA]
             ↓
         [Digitar código da sala]
             ↓
         [Sala encontrada] → Entra como jogador
             ↓
         [Aguardando outros + marcar ready]
             ↓
         [Jogo inicia (quando o host iniciar)]
```

---

## 19. SONS E FEEDBACK AUDIOVISUAL

### 19.1 Inventário de Sons

| ID | Descrição | Duração | Quando toca |
|----|-----------|---------|-------------|
| `dice_roll` | Barulho de dado rolando | 0.8s | Ao começar a animar o dado |
| `dice_land` | Dado parou | 0.2s | Ao mostrar resultado final |
| `piece_step` | Peça pulando para a próxima casa | 0.1s | A cada casa percorrida |
| `snake_hiss` | Cobra assobiando | 1.0s | Ao cair na cobra |
| `ladder_climb` | Subindo escada (whoosh) | 0.8s | Ao pegar escada |
| `victory_jingle` | Música de vitória | 3.0s | Ao ganhar a partida |
| `defeat_sound` | Som de derrota | 1.5s | Ao perder a partida |
| `turn_start` | Sino suave | 0.3s | Ao começar o turno do jogador |
| `coin_gain` | Moedas caindo | 1.5s | Ao exibir moedas ganhas |
| `item_unlock` | Fanfarra de desbloqueio | 1.0s | Ao desbloquear item |
| `button_click` | Clique suave | 0.1s | Em qualquer botão UI |
| `chat_message` | Notificação suave | 0.2s | Nova mensagem no chat |

### 19.2 Música de Fundo

- Cada tema de tabuleiro tem sua própria trilha de música de fundo em loop.
- Volume da música é independente dos efeitos sonoros.
- A música é pausada durante a tela de resultados.

### 19.3 Feedback Háptico (Mobile)

```typescript
type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

function triggerHaptics(pattern: HapticPattern): void {
  if (!navigator.vibrate) return;

  const patterns: Record<HapticPattern, number[]> = {
    light:   [10],
    medium:  [30],
    heavy:   [60],
    success: [30, 50, 30],
    error:   [100, 30, 100]
  };

  navigator.vibrate(patterns[pattern]);
}
```

---

## 20. ACESSIBILIDADE E RESPONSIVIDADE

### 20.1 Acessibilidade (a11y)

- Todo botão interativo tem `aria-label` descritivo.
- O número do dado é anunciado via `aria-live` region após rolagem.
- Movimentos de peças são descritos em texto alternativo para screen readers.
- Contraste de cor mínimo 4.5:1 entre texto e fundo (WCAG AA).
- Suporte a navegação por teclado no menu (Tab, Enter, Escape).
- Opção de "Modo Daltonismo" nas configurações (filtros SVG de cor).
- `prefers-reduced-motion`: desativa animações de movimento para usuários que preferem.

```css
@media (prefers-reduced-motion: reduce) {
  .piece-movement,
  .dice-animation,
  .snake-animation,
  .ladder-animation {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 20.2 Performance

- O tabuleiro deve renderizar a 60fps em dispositivos médios.
- Usar `will-change: transform` nas peças que se movem.
- Imagens do avatar são lazy-loaded.
- Assets de áudio são pré-carregados em background após o primeiro render.
- Firestore listeners são desativados ao sair da tela de jogo (evitar memory leaks).
- Usar `React.memo` e `useMemo` nos componentes de célula do tabuleiro (100 células = renderização pesada se não otimizada).

---

## 21. CONSIDERAÇÕES DE SEGURANÇA

### 21.1 Anti-Cheat Online

- **Nenhuma lógica crítica de jogo roda no cliente** em partidas online.
- O cliente apenas exibe o estado e envia intenções (ex: "quero rolar o dado").
- O Cloud Function valida cada jogada, calcula o resultado e atualiza o Firestore.
- O resultado do dado é gerado no servidor, não no cliente.
- Se um cliente tentar manipular o Firestore diretamente (sem passar pela Cloud Function), as Security Rules bloqueiam.

### 21.2 Rate Limiting

- O Cloud Function `validateMove` limita a **1 chamada por segundo por usuário**.
- Se um usuário tentar fazer múltiplas jogadas em sequência rápida, a segunda chamada é rejeitada.

### 21.3 Validação de Dados de Entrada

Toda entrada do usuário é validada tanto no cliente (para UX imediata) quanto no servidor (para segurança):
- Nome de usuário: 2–20 caracteres, apenas letras, números, espaços e underscores.
- Código da sala: exatamente 6 caracteres alfanuméricos.
- Mensagens de chat: máx 200 caracteres, sanitizadas contra XSS.
- Configurações de sala: valores permitidos em whitelist.

### 21.4 Proteção de Dados

- Senhas gerenciadas exclusivamente pelo Firebase Auth (nunca armazenadas em texto plano).
- Emails dos usuários não são expostos para outros jogadores (apenas displayName e avatar).
- O histórico de chat de salas encerradas pode ser deletado automaticamente após 24h via Cloud Scheduler.

---

## 22. CRONOGRAMA SUGERIDO DE DESENVOLVIMENTO

### Fase 1 — Fundação (Semanas 1–2)
- [ ] Setup do projeto (Vite + React + TypeScript + Tailwind)
- [ ] Configuração do Firebase (Auth, Firestore, Functions, Hosting)
- [ ] Implementar o `gameEngine.ts` com toda a lógica pura (sem UI)
- [ ] Testes unitários do engine (Vitest)
- [ ] Componente básico do tabuleiro (grid sem animações)

### Fase 2 — Modo Bot (Semanas 3–4)
- [ ] Implementar `botAI.ts` com os 3 níveis de dificuldade
- [ ] Animação básica do dado
- [ ] Animação de movimento de peças (casa a casa)
- [ ] Tela de configuração de partida com bots
- [ ] Tela de resultados básica

### Fase 3 — Modo Local (Semana 5)
- [ ] Fluxo de passagem de turno entre jogadores locais
- [ ] Modal "Passe o dispositivo"
- [ ] Salvar/restaurar partida local (localStorage)
- [ ] Tela de configuração de jogadores locais

### Fase 4 — Avatar e Customização (Semanas 6–7)
- [ ] Sistema de camadas do avatar (SVG layering)
- [ ] Editor de avatar com todas as categorias
- [ ] Armazenar/recuperar avatar do Firestore
- [ ] Itens iniciais gratuitos desbloqueados

### Fase 5 — Modo Online (Semanas 8–10)
- [ ] Firebase Authentication (email + Google)
- [ ] Cloud Functions: `validateMove`, `handleVictory`
- [ ] Sistema de salas (criar, entrar, lobby, ready, countdown)
- [ ] Sincronização em tempo real via `onSnapshot`
- [ ] Sistema de presença e desconexão
- [ ] Chat da sala

### Fase 6 — Sistema de Moedas (Semana 11)
- [ ] Cloud Function `handleVictory` com distribuição de moedas
- [ ] Cloud Function `purchaseItem`
- [ ] Loja de itens com moedas
- [ ] Tela de resultados com animação de moedas
- [ ] Histórico de transações no perfil

### Fase 7 — Polimento (Semanas 12–13)
- [ ] Animações completas (cobras, escadas, vitória)
- [ ] Integração de sons com Howler.js
- [ ] Temas de tabuleiro (floresta, espacial)
- [ ] Personalidades dos bots (catchphrases, reações)
- [ ] Acessibilidade (aria-labels, reduced-motion)
- [ ] Responsividade mobile

### Fase 8 — QA e Deploy (Semana 14)
- [ ] Testes end-to-end com Playwright
- [ ] Testes de carga no Firestore (múltiplas salas simultâneas)
- [ ] Deploy Firebase Hosting
- [ ] Configuração de CI/CD (GitHub Actions)
- [ ] Monitoramento (Firebase Crashlytics / Analytics)

---

## APÊNDICE A — CONSTANTES DO JOGO

```typescript
// src/engine/boardConfig.ts

export const DEFAULT_SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78
};

export const DEFAULT_LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91
};

export const BOARD_SIZE = 100;
export const DICE_FACES = 6;
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const BOT_HEARTBEAT_INTERVAL = 5000;       // ms
export const PLAYER_TIMEOUT_THRESHOLD = 15000;    // ms
export const PLAYER_ABANDON_THRESHOLD = 60000;    // ms
export const ROOM_CODE_LENGTH = 6;
export const CHAT_MAX_LENGTH = 200;
export const COINS_DAILY_BONUS = 50;

export const PLACEMENT_COINS = [100, 40, 20, 10] as const;

export const ANIMATION_SPEEDS = {
  slow: 300,
  normal: 150,
  fast: 75
} as const;
```

---

## APÊNDICE B — GERADOR DE CÓDIGO DE SALA

```typescript
// src/utils/roomCodeGenerator.ts

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem caracteres ambíguos (0/O, 1/I)

export function generateRoomCode(length: number = 6): string {
  let code = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    code += CHARS[array[i] % CHARS.length];
  }
  return code;
}
```

---

## APÊNDICE C — GLOSSÁRIO

| Termo | Definição |
|-------|-----------|
| **Snake** | Cobra no tabuleiro; faz o jogador descer da posição da cabeça até a cauda. |
| **Ladder** | Escada no tabuleiro; faz o jogador subir da base até o topo. |
| **Rubber-banding** | Técnica de balanceamento onde o jogo favorece levemente quem está perdendo para manter a partida competitiva. |
| **Cloud Function** | Código serverless rodando no Firebase que executa lógica de servidor. |
| **onSnapshot** | Método do Firestore SDK que escuta mudanças em tempo real em um documento. |
| **Heartbeat** | Sinal periódico enviado pelo cliente para indicar que ainda está conectado. |
| **Paper doll** | Sistema de avatar com camadas sobrepostas que podem ser trocadas independentemente. |
| **Batch write** | Operação do Firestore que executa múltiplas escritas atomicamente. |
| **Admin SDK** | SDK do Firebase que roda com permissões de administrador, bypassa as Security Rules. |
| **Boustrophedon** | Padrão de leitura alternado (esquerda-direita, depois direita-esquerda), como o tabuleiro é numerado. |
| **Game authority** | O ponto central de confiança que define o estado "verdadeiro" do jogo (servidor no modo online). |

---

*Este documento possui mais de 1300 linhas e cobre todos os aspectos do desenvolvimento do jogo Cobrinhas & Escadas: engine do jogo, modos de jogo (bots/local/online), arquitetura Firebase, Security Rules, sistema de salas, customização de personagens, sistema de moedas, UI/UX, animações, segurança e cronograma. Use-o como referência ao longo de todo o desenvolvimento.*
