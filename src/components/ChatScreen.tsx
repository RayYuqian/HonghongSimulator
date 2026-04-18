import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, HeartPulse } from 'lucide-react';
import { type Character } from '../data/characters';
import { generateAIResponse, generateRandomScenario, type ChatMessage } from '../services/llm';

interface ChatScreenProps {
  userGender: '男' | '女';
  character: Character;
  scenario: string;
  onBack: () => void;
  onComplete: (history: any[], mood: number) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ userGender, character, scenario, onBack, onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  // Randomize initial mood between 30 and 60 instead of fixed 50
  const [mood, setMood] = useState(() => Math.floor(Math.random() * 31) + 30); // 30 to 60
  const [chatScenario, setChatScenario] = useState(scenario);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  // Fetch initial message
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchOpening = async () => {
      setIsGenerating(true);
      try {
        let activeScenario = scenario;
        
        // If no scenario provided, generate a random one
        if (!activeScenario) {
          activeScenario = await generateRandomScenario(character, userGender);
          // We need to store it somewhere if we want to show it in the pill
          // Let's add an internal state for scenario
          setChatScenario(activeScenario);
        }

        const aiRes = await generateAIResponse(userGender, character, activeScenario, [], 50);
        setMessages([{ role: 'assistant', content: aiRes.reply }]);
        setMood(Math.max(0, Math.min(100, 50 + aiRes.moodChange)));
      } catch (err: any) {
        setMessages([{ role: 'assistant', content: '（空气突然安静...）' }]);
      } finally {
        setIsGenerating(false);
      }
    };
    fetchOpening();
  }, []); // Only once on mount

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
      // Fetch AI response
      const aiRes = await generateAIResponse(userGender, character, scenario, newMessages, mood);
      const updatedMood = Math.max(0, Math.min(100, mood + aiRes.moodChange));
      setMood(updatedMood);

      const updatedMessages: ChatMessage[] = [...newMessages, { role: 'assistant', content: aiRes.reply }];
      setMessages(updatedMessages);

      if (updatedMessages.length >= 12 || updatedMood >= 100 || updatedMood <= 0) {
        setTimeout(() => onComplete(updatedMessages, updatedMood), 2000);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || '未知错误';
      setMessages(prev => [...prev, { role: 'system', content: `（API 请求失败了：${errMsg}。如果是 429 报错，说明该模型现在太火爆被限流了）` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={onBack} style={styles.iconBtn}><ArrowLeft size={20} color="var(--dark-green)" /></button>
        <div style={styles.headerTitle}>
          <img src={character.avatar} alt="avatar" style={styles.headerAvatar} />
          <div style={styles.headerInfo}>
            <span style={styles.name}>{character.name}</span>
            <div style={styles.moodBarContainer}>
              <HeartPulse size={12} color="var(--danger)" />
              <div style={styles.moodBarBg}>
                <div style={{ ...styles.moodBarFill, width: `${mood}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: 32 }}></div> {/* Spacer for flex balance */}
      </header>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        <div style={styles.scenarioPill}>
          场景：{chatScenario || '正在生成冲突场景...'}
        </div>
        
        {messages.length === 0 && isGenerating && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontStyle: 'italic', fontSize: '16px' }}>
            {character.name} 正在输入...
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} style={{
            ...styles.messageWrapper,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {msg.role === 'assistant' && <img src={character.avatar} alt="AI" style={styles.msgAvatar} />}
            <div style={{
              ...styles.bubble,
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

      {/* Input Area */}
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="哄哄Ta..."
        />
        <button style={styles.sendBtn} onClick={handleSend}>
          <Send size={18} color="white" />
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
    backgroundColor: '#f5f7f6',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
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
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  name: {
    fontWeight: 600,
    fontSize: '22px'
  },
  moodBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  moodBarBg: {
    width: '80px',
    height: '6px',
    backgroundColor: '#eaeaea',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  moodBarFill: {
    height: '100%',
    backgroundColor: 'var(--primary-green)',
    transition: 'width 0.3s ease'
  },
  chatArea: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  messageWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px'
  },
  msgAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '20px',
    lineHeight: 1.5,
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
    whiteSpace: 'pre-wrap'
  },
  inputArea: {
    padding: '16px',
    backgroundColor: 'var(--white)',
    display: 'flex',
    gap: '12px',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid #e0e0e0',
    fontSize: '20px',
    outline: 'none',
    backgroundColor: '#f9f9f9'
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-green)',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  scenarioPill: {
    alignSelf: 'center',
    backgroundColor: '#e8ecea',
    color: 'var(--text-light)',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    marginBottom: '8px',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 1.4
  }
};
