import { useState, useEffect } from 'react';
import './App.css';
import { IntroScreen } from './components/IntroScreen';
import { ChatScreen } from './components/ChatScreen';
import { ResultScreen } from './components/ResultScreen';
import { LoginScreen } from './components/LoginScreen';
import { type Character } from './data/characters';
import { type ChatMessage } from './services/llm';
import { useAuth } from './hooks/useAuth';
import backgroundBg from './assets/app_background_nature_1776493439198.png';

type GameState = 'loading' | 'login' | 'intro' | 'chat' | 'results';

function App() {
  const { user, isLoading, login, register, logout } = useAuth();
  const [gameState, setGameState] = useState<GameState>('loading');
  const [userGender, setUserGender] = useState<'男' | '女'>('男');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [scenario, setScenario] = useState<string>('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [finalMood, setFinalMood] = useState<number>(50);

  useEffect(() => {
    if (!isLoading) {
      setGameState(user ? 'intro' : 'login');
    }
  }, [isLoading, user]);

  const handleStart = (gender: '男' | '女', char: Character, chosenScenario: string) => {
    setUserGender(gender);
    setSelectedChar(char);
    setScenario(chosenScenario);
    setGameState('chat');
  };

  const handleBackToIntro = () => {
    setGameState('intro');
    setSelectedChar(null);
    setScenario('');
    setHistory([]);
  };

  const handleComplete = (chatHistory: ChatMessage[], mood: number, chatScenario: string) => {
    setHistory(chatHistory);
    setFinalMood(mood);
    setScenario(chatScenario);
    setGameState('results');
  };

  const handleLogout = () => {
    logout();
    handleBackToIntro();
  };

  const isDesktop = window.innerWidth > 500;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `url(${backgroundBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        height: '100%',
        maxHeight: '900px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: isDesktop ? '24px' : '0'
      }}>
        {gameState === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <p style={{ color: 'var(--text-light)', fontSize: '18px' }}>加载中...</p>
          </div>
        )}

        {gameState === 'login' && (
          <LoginScreen onLogin={login} onRegister={register} />
        )}

        {gameState === 'intro' && user && (
          <IntroScreen user={user} onLogout={handleLogout} onStart={handleStart} />
        )}

        {gameState === 'chat' && selectedChar && (
          <ChatScreen
            userGender={userGender}
            character={selectedChar}
            scenario={scenario}
            onBack={handleBackToIntro}
            onComplete={handleComplete}
          />
        )}

        {gameState === 'results' && selectedChar && (
          <ResultScreen
            userGender={userGender}
            character={selectedChar}
            scenario={scenario}
            history={history}
            finalMood={finalMood}
            onRestart={handleBackToIntro}
          />
        )}
      </div>
    </div>
  );
}

export default App;
