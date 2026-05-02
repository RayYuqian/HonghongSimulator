import { useState } from 'react';
import { Leaf, User, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';
import styles from './LoginScreen.module.css';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('用户名和密码不能为空');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await onLogin(username.trim(), password);
      } else {
        await onRegister(username.trim(), password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Leaf color="var(--primary-green)" size={36} />
        <h1 className={styles.title}>哄哄模拟器</h1>
        <p className={styles.subtitle}>登录后才能开始修炼情商</p>
      </header>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={styles.tab}
            style={{
              borderBottomColor: tab === 'login' ? 'var(--primary-green)' : 'transparent',
              color: tab === 'login' ? 'var(--dark-green)' : 'var(--text-light)',
            }}
            onClick={() => { setTab('login'); setError(''); }}
          >
            <LogIn size={16} />
            登录
          </button>
          <button
            className={styles.tab}
            style={{
              borderBottomColor: tab === 'register' ? 'var(--primary-green)' : 'transparent',
              color: tab === 'register' ? 'var(--dark-green)' : 'var(--text-light)',
            }}
            onClick={() => { setTab('register'); setError(''); }}
          >
            <UserPlus size={16} />
            注册
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <User size={18} color="var(--primary-green)" style={{ marginTop: '14px' }} />
            <input
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="用户名"
              autoComplete="username"
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock size={18} color="var(--primary-green)" style={{ marginTop: '14px' }} />
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="密码"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={`btn ${styles.submitBtn}`}
            disabled={isSubmitting}
            onClick={handleSubmit}
            style={{ opacity: isSubmitting ? 0.6 : 1 }}
          >
            {isSubmitting ? (
              <Loader2 size={20} style={{ animation: 'spin 2s linear infinite' }} />
            ) : tab === 'login' ? (
              <>登录 <LogIn size={18} /></>
            ) : (
              <>注册 <UserPlus size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
