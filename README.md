# ♠ CALL BREAK ARENA

A production-grade, 4-player multiplayer Call Break web game built with a **server-authoritative game engine**, **Socket.IO realtime synchronization**, **3-tier Bot AI engine**, and a responsive **React + Tailwind CSS** card room interface.

Strictly **virtual-coins-only** economy with zero cash-out or gambling functionality.

---

## 🌟 Key Highlights

- **Server-Authoritative Game Engine**: Clients never compute legal moves, card legality, trick winners, or scores. The server owns all game state and enforces Call Break rules.
- **Card Privacy**: Opponent hands are never transmitted over the wire. Clients receive only their own private cards, public tricks, and opponent card counts.
- **3-Tier Tactical Bots**:
  - `Easy`: Rule-abiding legal play with simple random weighting.
  - `Medium`: Understands target bid vs. tricks won, economizes high cards, ducks when unable to win.
  - `Hard`: Tracks played cards to identify boss cards, actively preserves trumps, and manages risk.
- **Realtime Multiplayer & Reconnects**: 4-seat rooms with instant Quick Play or 6-letter private invite codes. If a human disconnects, a bot seamlessly substitutes turns until the player reconnects.
- **Pure Virtual Economy**: 1,000 starting coins, table stakes, match payouts, and daily reload bonus (+500 coins). Idempotent server ledger with zero paid dependencies.
- **Procedural Audio**: Web Audio API sound synthesizer for card flips, trick wins, turn alerts, and victory fanfares (zero external audio files needed).

---

## 🗂️ Project Structure

```
game_multiplayer/
├── package.json              # Monorepo scripts (dev, test, build)
├── shared/                   # Shared types, constants, events & rules
│   └── constants.js          # Suits, ranks, game phases, events, economy
├── server/
│   ├── src/
│   │   ├── game/
│   │   │   ├── deck/         # 52-card deck generator & cryptographic shuffle
│   │   │   ├── rules/        # Legal move validator & trick resolution
│   │   │   ├── scoring/      # Call Break round & match scoring engine
│   │   │   └── engine/       # CallBreakGame authoritative state machine
│   │   ├── bots/             # BotEngine with Easy, Medium, and Hard profiles
│   │   ├── rooms/            # Room & RoomManager with 4-seat management
│   │   ├── services/         # VirtualCoinService (idempotent ledger & persistence)
│   │   ├── socket/           # Socket.IO event handlers
│   │   └── server.js         # Express + HTTP + Socket.IO server
│   └── tests/                # 23 unit & integration tests
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── cards/        # PlayingCard (vector SVG suits and pips)
    │   │   ├── table/        # CardTable, PlayerSeat, HandFan, TrickCenter
    │   │   ├── modals/       # BiddingModal, RoundResult, MatchResult, Rules
    │   │   └── common/       # Navbar, ProfileModal, Toast
    │   ├── hooks/            # useSocket real-time client hook
    │   ├── pages/            # HomePage, LobbyPage, GamePage
    │   └── services/         # SoundEngine, Storage
    └── dist/                 # Production web build
```

---

## 🎮 Call Break Game Rules

1. **Standard 52-Card Deck**: Exactly 13 cards are dealt to each of the 4 players.
2. **Permanent Trump**: **Spades (♠)** are always the trump suit and beat cards of any other suit.
3. **Bidding (Calling)**: Each player declares how many tricks (1 to 8) they aim to win before tricks start.
4. **Trick Play**:
   - **Must Follow Suit**: Players must play a card of the led suit if they hold one.
   - **Must Trump if Void**: If void of the led suit, players must play a Spade (trump) if they hold one.
   - **Must Overtrump**: If another player has already trumped with a Spade, the player must play a higher Spade if held.
   - **Discard**: If void of both the led suit and Spades, any card may be discarded.
5. **Scoring Formula**:
   - $\text{Tricks Won} \ge \text{Bid}$: $\text{Score} = \text{Bid} + (\text{Tricks Won} - \text{Bid}) \times 0.1$ (e.g. Bid 3, Won 4 $\rightarrow$ `+3.1`)
   - $\text{Tricks Won} < \text{Bid}$: $\text{Score} = -\text{Bid}$ (e.g. Bid 4, Won 3 $\rightarrow$ `-4.0`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+

### 1. Install Dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Run Automated Test Suite
```bash
# Run all unit and integration tests from root
npm test
```
*Executes 23 tests covering deck generation, shuffle randomness, legal move rules, trick resolution, scoring formulas, bot decision profiles, and end-to-end socket multiplayer flows.*

### 3. Start Development Server
```bash
# Start backend server (port 3001)
npm run dev:server

# Start Vite client with hot module replacement (port 5173)
npm run dev:client
```

Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
npm start
```
The server serves the compiled client directly at `http://localhost:3001`.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP and WebSocket server port |
| `BOT_DELAY` | `800` | Bot decision delay in milliseconds (`0` for deterministic automated tests) |

---

## 🔒 Security & Integrity

- **Zero Client-Authoritative Logic**: Scores, turns, hands, and coins are validated exclusively on the backend.
- **Rate-Limiting & Input Sanitization**: Room codes, bids, and chat inputs are strictly typed and clamped.
- **Idempotent Virtual Ledger**: Table stakes and match reward payouts prevent duplicate transactions through transaction hashing.
