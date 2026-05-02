import { LogOut } from 'lucide-react';
import styles from './UserBar.module.css';

interface UserBarProps {
  username: string;
  onLogout: () => void;
}

export function UserBar({ username, onLogout }: UserBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.name}>{username}</span>
      <button className={styles.logoutBtn} onClick={onLogout}>
        <LogOut size={14} />
        退出登录
      </button>
    </div>
  );
}
