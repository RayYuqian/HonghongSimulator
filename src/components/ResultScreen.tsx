import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Zap, AlertTriangle } from 'lucide-react';
import { type Character } from '../data/characters';
import { type ChatMessage, generateEQReport, type EQReport } from '../services/llm';
import { apiSaveGame } from '../services/api';
import styles from './ResultScreen.module.css';

interface ResultScreenProps {
  userGender: '男' | '女';
  character: Character;
  scenario: string;
  history: ChatMessage[];
  finalMood: number;
  onRestart: () => void;
}

export function ResultScreen({ userGender, character, scenario, history, finalMood, onRestart }: ResultScreenProps) {
  const [report, setReport] = useState<EQReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateEQReport(userGender, character, scenario, history, finalMood).then(res => {
      setReport(res);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!report || !character) return;

    apiSaveGame({
      character_id: character.id,
      character_name: character.name,
      character_personality: character.personality,
      user_gender: userGender,
      scenario,
      final_mood: finalMood,
      eq_score: report.score,
      eq_summary: report.summary,
      chat_history: history,
    }).catch(err => console.error('保存游戏记录失败:', err));
  }, [report]);

  const getScoreColor = (score: number) => {
    if (score < 60) return '#cf7c7c';
    if (score < 80) return '#f59e0b';
    return 'var(--primary-green)';
  };

  const scoreColor = report ? getScoreColor(report.score) : 'var(--primary-green)';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={onRestart} className={styles.iconBtn}><ArrowLeft size={20} color="var(--dark-green)" /></button>
        <h2 style={{ fontSize: '20px', color: 'var(--dark-green)' }}>情商复盘报告</h2>
        <div style={{ width: 32 }}></div>
      </header>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader2 size={40} color="var(--primary-green)" style={{ animation: 'spin 2s linear infinite' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>大师正在连夜分析你的发言...</p>
          </div>
        ) : (
          report && (
            <div className={styles.reportCard}>
              <div className={styles.scoreSection}>
                <div className={styles.scoreCircle} style={{ borderColor: scoreColor }}>
                  <span className={styles.scoreNumber} style={{ color: scoreColor }}>{report.score}</span>
                  <span className={styles.scoreLabel} style={{ color: scoreColor }}>分</span>
                </div>
                <div className={styles.moodLabel}>对方最终心情心率: {finalMood}/100</div>
              </div>

              <div className={styles.summaryBox} style={{ borderLeftColor: scoreColor }}>
                <p className={styles.summaryText}>"{report.summary}"</p>
              </div>

              {report.highlights?.length > 0 && (
                <div className={styles.sectionPill}>
                  <h4 className={styles.sectionTitle}><Zap size={16} color="#eab308" /> 高光时刻</h4>
                  <ul className={styles.list}>
                    {report.highlights.map((h, i) => (
                      <li key={i} className={styles.listItem}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.improvements?.length > 0 && (
                <div className={styles.sectionPill}>
                  <h4 className={styles.sectionTitle}><AlertTriangle size={16} color="var(--danger)" /> 踩雷警告</h4>
                  <ul className={styles.list}>
                    {report.improvements.map((imp, i) => (
                      <li key={i} className={styles.listItem}>{imp}</li>
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
}
