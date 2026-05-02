import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { generateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register — per auth-register skill
router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }

  if (username.length < 3 || username.length > 30) {
    res.status(400).json({ error: '用户名长度需在3-30个字符之间' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: '密码长度至少8个字符' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: '用户名已存在' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);

  const token = generateToken(result.lastInsertRowid as number, username);
  res.status(201).json({ token, user: { id: result.lastInsertRowid, username } });
});

// POST /api/auth/login — per auth-login skill
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }

  const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username) as { id: number; username: string; password: string } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const token = generateToken(user.id, user.username);
  res.json({ token, user: { id: user.id, username: user.username } });
});

export default router;
