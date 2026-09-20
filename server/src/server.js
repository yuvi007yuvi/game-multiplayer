import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupSocketHandlers } from './socket/socketHandler.js';
import { coinService } from './services/coinService.js';
import { roomManager } from './rooms/roomManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/user/:id', (req, res) => {
  const user = coinService.getUser(req.params.id);
  res.json({ success: true, user });
});

app.get('/api/leaderboard', (req, res) => {
  const allUsers = Array.from(coinService.users.values());
  const topUsers = allUsers
    .map(u => ({
      id: u.id,
      name: u.name,
      coins: u.coins,
      gamesPlayed: u.stats?.gamesPlayed || 0,
      gamesWon: u.stats?.gamesWon || 0
    }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 10);

  res.json({ success: true, leaderboard: topUsers });
});

app.get('/api/stats', (req, res) => {
  res.json({
    activeRooms: roomManager.rooms.size,
    totalRegisteredUsers: coinService.users.size
  });
});

// Serve frontend production build if available
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Call Break Arena API Server Running. Start client via npm run dev:client');
    }
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`♠ Call Break Arena Server running on port ${PORT}`);
});
