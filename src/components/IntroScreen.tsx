import React, { useState } from 'react';
import { Leaf, ArrowRight } from 'lucide-react';
import { CHARACTERS, type Character } from '../data/characters';

interface IntroScreenProps {
  onStart: (userGender: '男' | '女', character: Character, scenario: string) => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const [userGender, setUserGender] = useState<'男' | '女'>('男');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  const handleStart = () => {
    if (!selectedChar) return;
    onStart(userGender, selectedChar, "");
  };

  return (
    <div className="intro-screen" style={styles.container}>
      <header style={styles.header}>
        <Leaf color="var(--primary-green)" size={32} />
        <h1 style={styles.title}>哄哄模拟器</h1>
        <p style={styles.subtitle}>单身模拟派的情商训练场</p>
      </header>

      <div style={styles.selectionArea}>
        {/* User Gender Selection */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={styles.sectionTitle}>你的性别</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {(['男', '女'] as const).map(g => (
              <button
                key={g}
                onClick={() => setUserGender(g)}
                style={{
                  ...styles.genderBtn,
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

        <h3 style={styles.sectionTitle}>选择攻略对象</h3>
        <div style={styles.grid}>
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              style={{
                ...styles.card,
                borderColor: selectedChar?.id === char.id ? 'var(--primary-green)' : 'transparent',
                backgroundColor: selectedChar?.id === char.id ? 'var(--light-green)' : '#fff',
              }}
              onClick={() => setSelectedChar(char)}
            >
              <img src={char.avatar} alt={char.name} style={styles.avatar} />
              <div style={styles.charInfo}>
                <div style={styles.charHeader}>
                  <span style={styles.charName}>{char.name}</span>
                  <span style={styles.tag}>{char.personality}</span>
                </div>
                <p style={styles.charDesc}>{char.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
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
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    overflowY: 'auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    marginTop: '20px'
  },
  title: {
    fontSize: '30px',
    color: 'var(--dark-green)',
    marginTop: '12px',
    marginBottom: '8px'
  },
  subtitle: {
    color: 'var(--text-light)',
    fontSize: '16px'
  },
  selectionArea: {
    flex: 1
  },
  sectionTitle: {
    fontSize: '18px',
    color: 'var(--text-main)',
    marginBottom: '16px',
    textAlign: 'center'
  },
  genderBtn: {
    padding: '8px 24px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: 500
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  card: {
    border: '2px solid transparent',
    borderRadius: '16px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: 'var(--shadow)'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--white)'
  },
  charInfo: {
    flex: 1
  },
  charHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    marginBottom: '4px'
  },
  charName: {
    fontWeight: 'bold',
    fontSize: '17px'
  },
  tag: {
    fontSize: '12px',
    backgroundColor: 'var(--primary-green)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '8px',
    textTransform: 'uppercase'
  },
  charDesc: {
    fontSize: '14px',
    color: 'var(--text-light)',
    lineHeight: 1.4
  },
  footer: {
    marginTop: '32px',
    paddingBottom: '20px'
  }
};
