import { useState } from 'react';
import './App.css';
import { IntroScreen } from './components/IntroScreen';
import { ChatScreen } from './components/ChatScreen';
import { ResultScreen } from './components/ResultScreen';
import { type Character } from './data/characters';
import backgroundBg from './assets/app_background_nature_1776493439198.png';

type GameState = 'intro' | 'chat' | 'results';

function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [userGender, setUserGender] = useState<'男'|'女'>('男');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [scenario, setScenario] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [finalMood, setFinalMood] = useState<number>(50);

  const handleStart = (gender: '男'|'女', char: Character, chosenScenario: string) => {
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

  const handleComplete = (chatHistory: any[], mood: number) => {
    setHistory(chatHistory);
    setFinalMood(mood);
    setGameState('results');
  };

  return (
    <div style={{
      ...styles.appWrapper,
      backgroundImage: `url(${backgroundBg})`
    }}>
      <div style={styles.appContainer}>
        {gameState === 'intro' && (
          <IntroScreen onStart={handleStart} />
        )}
        
        {gameState === 'chat' && selectedChar && (
          <ChatScreen 
            userGender={userGender}
            character={selectedChar} 
            scenario={scenario} 
            onBack={handleBackToIntro}
            onComplete={(chatHistory, mood) => handleComplete(chatHistory, mood)}
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

const styles: Record<string, React.CSSProperties> = {
  appWrapper: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backdropFilter: 'blur(10px)'
  },
  appContainer: {
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
    /* Rounded corners for desktop feel, square on small mobile */
    borderRadius: window.innerWidth > 500 ? '24px' : '0'
  }
};

export default App;
