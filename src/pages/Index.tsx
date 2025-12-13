import { useState } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PermissionScreen } from '@/components/PermissionScreen';
import { AssessmentScreen } from '@/components/AssessmentScreen';
import { ResultsScreen } from '@/components/ResultsScreen';
import { AtlasIntroScreen } from '@/components/AtlasIntroScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { ExchangeScreen } from '@/components/ExchangeScreen';
import { InsightsScreen } from '@/components/InsightsScreen';
import { useTokens } from '@/hooks/useTokens';
import type { AssessmentAnswer } from '@/lib/edge-data';

type AppScreen = 'welcome' | 'permission' | 'assessment' | 'results' | 'atlas' | 'home' | 'exchange' | 'insights';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [selectedMirrors, setSelectedMirrors] = useState<string[]>([]);
  
  const { balance, earnTokens, spendTokens } = useTokens(5);

  const handleAssessmentComplete = (answers: AssessmentAnswer[]) => {
    setAssessmentAnswers(answers);
    setCurrentScreen('results');
  };

  const handleMirrorSelect = (mirrorId: string) => {
    setSelectedMirrors(prev => 
      prev.includes(mirrorId) 
        ? prev.filter(id => id !== mirrorId)
        : [...prev, mirrorId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onContinue={() => setCurrentScreen('permission')} />
      )}
      {currentScreen === 'permission' && (
        <PermissionScreen onStartScan={() => setCurrentScreen('assessment')} />
      )}
      {currentScreen === 'assessment' && (
        <AssessmentScreen onComplete={handleAssessmentComplete} />
      )}
      {currentScreen === 'results' && (
        <ResultsScreen 
          answers={assessmentAnswers} 
          onContinue={() => setCurrentScreen('atlas')} 
        />
      )}
      {currentScreen === 'atlas' && (
        <AtlasIntroScreen onContinue={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'home' && (
        <HomeScreen 
          selectedMirrors={selectedMirrors}
          onSelectMirror={handleMirrorSelect}
          tokenBalance={balance}
          onOpenExchange={() => setCurrentScreen('exchange')}
          onOpenInsights={() => setCurrentScreen('insights')}
        />
      )}
      {currentScreen === 'exchange' && (
        <ExchangeScreen
          balance={balance}
          onEarn={earnTokens}
          onSpend={spendTokens}
          onBack={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'insights' && (
        <InsightsScreen
          answers={assessmentAnswers}
          tokenBalance={balance}
          onBack={() => setCurrentScreen('home')}
        />
      )}
    </div>
  );
};

export default Index;