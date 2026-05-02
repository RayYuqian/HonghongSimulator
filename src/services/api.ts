import { type LoginResponse, type AuthUser } from '../types/auth';

const TOKEN_KEY = 'auth_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `请求失败 (${res.status})`);
  }
  return res;
}

export async function apiRegister(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || '注册失败');
  }
  const data: LoginResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || '登录失败');
  }
  const data: LoginResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function apiGetMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await request('/api/auth/me');
    const data = await res.json();
    return data.user;
  } catch {
    clearToken();
    return null;
  }
}

export async function apiSaveGame(game: {
  character_id: string;
  character_name: string;
  character_personality: string;
  user_gender: string;
  scenario: string;
  final_mood: number;
  eq_score: number | null;
  eq_summary: string | null;
  chat_history: unknown[];
}): Promise<void> {
  await request('/api/games', {
    method: 'POST',
    body: JSON.stringify(game),
  });
}

export function apiLogout(): void {
  clearToken();
}

export { getToken };
