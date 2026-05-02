import { Router, type Response } from 'express';
import { verifyToken, type AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();

router.post('/', verifyToken, (req: AuthRequest, res: Response) => {
  const { character_id, character_name, character_personality, user_gender, scenario, final_mood, eq_score, eq_summary, chat_history } = req.body;

  if (!character_id || !scenario || final_mood === undefined) {
    res.status(400).json({ error: '缺少必要的游戏数据' });
    return;
  }

  const result = db.prepare(`
    INSERT INTO game_history (user_id, character_id, character_name, character_personality, user_gender, scenario, final_mood, eq_score, eq_summary, chat_history)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.userId,
    character_id,
    character_name || '',
    character_personality || '',
    user_gender || '',
    scenario,
    final_mood,
    eq_score ?? null,
    eq_summary ?? null,
    JSON.stringify(chat_history || [])
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/', verifyToken, (req: AuthRequest, res: Response) => {
  const games = db.prepare(`
    SELECT id, character_id, character_name, character_personality, user_gender, scenario, final_mood, eq_score, eq_summary, chat_history, played_at
    FROM game_history
    WHERE user_id = ?
    ORDER BY played_at DESC
    LIMIT 50
  `).all(req.userId);

  const parsed = (games as any[]).map(g => ({
    ...g,
    chat_history: JSON.parse(g.chat_history),
  }));

  res.json({ games: parsed });
});

export default router;
