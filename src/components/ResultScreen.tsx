import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Zap, AlertTriangle } from 'lucide-react';
import { type Character } from '../data/characters';
import { type ChatMessage, generateEQReport, type EQReport } from '../services/llm';

interface ResultScreenProps {
  userGender: '男' | '女';
  character: Character;
  scenario: string;
  history: ChatMessage[];
  finalMood: number;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ userGender, character, scenario, history, finalMood, onRestart }) => {
  const [report, setReport] = useState<EQReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateEQReport(userGender, character, scenario, history, finalMood).then(res => {
      setReport(res);
      setIsLoading(false);
    });
  }, [character, scenario, history, finalMood]);

  const getScoreColor = (score: number) => {
    if (score < 60) return '#cf7c7c'; // Red
    if (score < 80) return '#f59e0b'; // Amber
    return 'var(--primary-green)'; // Green
  };

  const scoreColor = report ? getScoreColor(report.score) : 'var(--primary-green)';

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onRestart} style={styles.iconBtn}><ArrowLeft size={20} color="var(--dark-green)" /></button>
        <h2 style={{ fontSize: '20px', color: 'var(--dark-green)' }}>情商复盘报告</h2>
        <div style={{ width: 32 }}></div>
      </header>

      <div style={styles.content}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <Loader2 className="animate-spin" size={40} color="var(--primary-green)" style={{ animation: 'spin 2s linear infinite' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>大师正在连夜分析你的发言...</p>
          </div>
        ) : (
          report && (
            <div style={styles.reportCard}>
              <div style={styles.scoreSection}>
                <div style={{ ...styles.scoreCircle, borderColor: scoreColor }}>
                  <span style={{ ...styles.scoreNumber, color: scoreColor }}>{report.score}</span>
                  <span style={{ ...styles.scoreLabel, color: scoreColor }}>分</span>
                </div>
                <div style={styles.moodLabel}>对方最终心情心率: {finalMood}/100</div>
              </div>

              <div style={{ ...styles.summaryBox, borderLeftColor: scoreColor }}>
                <p style={styles.summaryText}>"{report.summary}"</p>
              </div>

              {report.highlights?.length > 0 && (
                <div style={styles.sectionPill}>
                  <h4 style={styles.sectionTitle}><Zap size={16} color="#eab308" /> 高光时刻</h4>
                  <ul style={styles.list}>
                    {report.highlights.map((h, i) => (
                      <li key={i} style={styles.listItem}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.improvements?.length > 0 && (
                <div style={styles.sectionPill}>
                  <h4 style={styles.sectionTitle}><AlertTriangle size={16} color="var(--danger)" /> 踩雷警告</h4>
                  <ul style={styles.list}>
                    {report.improvements.map((imp, i) => (
                      <li key={i} style={styles.listItem}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="btn" onClick={onRestart} style={{ width: '100%', marginTop: '24px' }}>
                重新修炼
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f7f6',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: 'var(--white)',
    boxShadow: 'var(--shadow)',
    zIndex: 10
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 16px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    opacity: 0.8
  },
  reportCard: {
    backgroundColor: 'var(--white)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    borderWidth: '6px',
    borderStyle: 'solid'
  },
  scoreNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: '20px',
    marginLeft: '2px',
    marginTop: '12px'
  },
  moodLabel: {
    marginTop: '12px',
    fontSize: '20px',
    color: 'var(--text-light)'
  },
  summaryBox: {
    backgroundColor: '#f9faf9',
    padding: '20px',
    borderRadius: '12px',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid'
  },
  summaryText: {
    fontSize: '20px',
    color: 'var(--text-main)',
    fontStyle: 'italic',
    lineHeight: 1.5
  },
  sectionPill: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  list: {
    listStyleType: 'disc',
    paddingLeft: '24px',
    margin: 0
  },
  listItem: {
    fontSize: '20px',
    color: 'var(--text-main)',
    marginBottom: '6px',
    lineHeight: 1.5
  }
};
