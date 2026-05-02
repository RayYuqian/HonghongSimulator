import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, HeartPulse } from 'lucide-react';
import { type Character } from '../data/characters';
import { generateAIResponse, generateRandomScenario, type ChatMessage } from '../services/llm';
import styles from './ChatScreen.module.css';

interface ChatScreenProps {
  userGender: '男' | '女';
  character: Character;
  scenario: string;
  onBack: () => void;
  onComplete: (history: ChatMessage[], mood: number, scenario: string) => void;
}

export function ChatScreen({ userGender, character, scenario, onBack, onComplete }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mood, setMood] = useState(() => Math.floor(Math.random() * 31) + 30);
  const [chatScenario, setChatScenario] = useState(scenario);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchOpening = async () => {
      setIsGenerating(true);
      try {
        let activeScenario = scenario;

        if (!activeScenario) {
          activeScenario = await generateRandomScenario(character, userGender);
          setChatScenario(activeScenario);
        }

        const aiRes = await generateAIResponse(userGender, character, activeScenario, [], 50);
        setMessages([{ role: 'assistant', content: aiRes.reply }]);
        setMood(Math.max(0, Math.min(100, 50 + aiRes.moodChange)));
      } catch (err: unknown) {
        setMessages([{ role: 'assistant', content: '（空气突然安静...）' }]);
      } finally {
        setIsGenerating(false);
      }
    };
    fetchOpening();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsGenerating(true);

    try {
      const aiRes = await generateAIResponse(userGender, character, chatScenario, newMessages, mood);
      const updatedMood = Math.max(0, Math.min(100, mood + aiRes.moodChange));
      setMood(updatedMood);

      const updatedMessages: ChatMessage[] = [...newMessages, { role: 'assistant', content: aiRes.reply }];
      setMessages(updatedMessages);

      if (updatedMessages.length >= 12 || updatedMood >= 100 || updatedMood <= 0) {
        setTimeout(() => onComplete(updatedMessages, updatedMood, chatScenario), 2000);
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : '未知错误';
      setMessages(prev => [...prev, { role: 'system', content: `（API 请求失败了：${errMsg}。如果是 429 报错，说明该模型现在太火爆被限流了）` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.iconBtn}><ArrowLeft size={20} color="var(--dark-green)" /></button>
        <div className={styles.headerTitle}>
          <img src={character.avatar} alt="avatar" className={styles.headerAvatar} />
          <div className={styles.headerInfo}>
            <span className={styles.name}>{character.name}</span>
            <div className={styles.moodBarContainer}>
              <HeartPulse size={12} color="var(--danger)" />
              <div className={styles.moodBarBg}>
                <div className={styles.moodBarFill} style={{ width: `${mood}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: 32 }}></div>
      </header>

      <div className={styles.chatArea}>
        <div className={styles.scenarioPill}>
          场景：{chatScenario || '正在生成冲突场景...'}
        </div>

        {messages.length === 0 && isGenerating && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontStyle: 'italic', fontSize: '16px' }}>
            {character.name} 正在输入...
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={styles.messageWrapper} style={{
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {msg.role === 'assistant' && <img src={character.avatar} alt="AI" className={styles.msgAvatar} />}
            <div className={styles.bubble} style={{
              backgroundColor: msg.role === 'user' ? 'var(--primary-green)' : '#fff',
              color: msg.role === 'user' ? 'white' : 'var(--text-main)',
              borderBottomLeftRadius: msg.role === 'assistant' ? 0 : 16,
              borderBottomRightRadius: msg.role === 'user' ? 0 : 16,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length > 0 && isGenerating && (
          <div style={{ alignSelf: 'flex-start', marginLeft: '72px', color: 'var(--text-light)', fontSize: '14px' }}>
            对方正在输入...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="哄哄Ta..."
        />
        <button className={styles.sendBtn} onClick={handleSend}>
          <Send size={18} color="white" />
        </button>
      </div>
    </div>
  );
}
