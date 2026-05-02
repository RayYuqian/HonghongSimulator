import { useState } from 'react';
import { Leaf, ArrowRight } from 'lucide-react';
import { CHARACTERS, type Character } from '../data/characters';
import { type AuthUser } from '../types/auth';
import { UserBar } from './UserBar';
import styles from './IntroScreen.module.css';

interface IntroScreenProps {
  user: AuthUser;
  onLogout: () => void;
  onStart: (userGender: '男' | '女', character: Character, scenario: string) => void;
}

export function IntroScreen({ user, onLogout, onStart }: IntroScreenProps) {
  const [userGender, setUserGender] = useState<'男' | '女'>('男');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  const handleStart = () => {
    if (!selectedChar) return;
    onStart(userGender, selectedChar, "");
  };

  return (
    <div className={styles.container}>
      <UserBar username={user.username} onLogout={onLogout} />

      <header className={styles.header}>
        <Leaf color="var(--primary-green)" size={32} />
        <h1 className={styles.title}>哄哄模拟器</h1>
        <p className={styles.subtitle}>单身模拟派的情商训练场</p>
      </header>

      <div className={styles.selectionArea}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h3 className={styles.sectionTitle}>你的性别</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {(['男', '女'] as const).map(g => (
              <button
                key={g}
                onClick={() => setUserGender(g)}
                className={styles.genderBtn}
                style={{
                  backgroundColor: userGender === g ? 'var(--primary-green)' : 'var(--white)',
                  color: userGender === g ? 'white' : 'var(--text-main)',
                  borderColor: userGender === g ? 'var(--primary-green)' : '#ddd'
                }}
              >
                {g}生
              </button>
            ))}
          </div>
        </div>

        <h3 className={styles.sectionTitle}>选择攻略对象</h3>
        <div className={styles.grid}>
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className={styles.card}
              style={{
                borderColor: selectedChar?.id === char.id ? 'var(--primary-green)' : 'transparent',
                backgroundColor: selectedChar?.id === char.id ? 'var(--light-green)' : '#fff',
              }}
              onClick={() => setSelectedChar(char)}
            >
              <img src={char.avatar} alt={char.name} className={styles.avatar} />
              <div className={styles.charInfo}>
                <div className={styles.charHeader}>
                  <span className={styles.charName}>{char.name}</span>
                  <span className={styles.tag}>{char.personality}</span>
                </div>
                <p className={styles.charDesc}>{char.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className="btn"
          disabled={!selectedChar}
          onClick={handleStart}
          style={{
            opacity: selectedChar ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
        >
          开始挑战 <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
