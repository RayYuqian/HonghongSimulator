import express from 'express';
import { verifyToken, type AuthRequest } from './middleware/auth';
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';

const app = express();
const PORT = 3001;

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/auth/me', verifyToken, (req: AuthRequest, res) => {
  res.json({ user: { id: req.userId, username: req.username } });
});

app.use('/api/games', gameRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
