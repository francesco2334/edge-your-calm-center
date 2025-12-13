import { useState } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PermissionScreen } from '@/components/PermissionScreen';
import { AssessmentScreen } from '@/components/AssessmentScreen';
import { ResultsScreen } from '@/components/ResultsScreen';
import { PaywallScreen } from '@/components/PaywallScreen';
import { AtlasIntroScreen } from '@/components/AtlasIntroScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { AllocateScreen } from '@/components/AllocateScreen';
import { InsightsScreen } from '@/components/InsightsScreen';
import { EducationSwiper } from '@/components/EducationSwiper';
import { useCharge } from '@/hooks/useCharge';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentAnswer } from '@/lib/edge-data';

type AppScreen = 'welcome' | 'permission' | 'assessment' | 'results' | 'paywall' | 'atlas' | 'home' | 'exchange' | 'insights' | 'learn';

const Index = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [selectedMirrors, setSelectedMirrors] = useState<string[]>([]);
  
  const { 
    balance, 
    activeSession, 
    earnCharge, 
    allocateCharge, 
    completeSession, 
    stats,
    streak,
    streakClaimedToday,
    reactionLeaderboard,
    claimDailyStreak,
    recordReactionTime,
  } = useCharge(5);

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

  const handleSubscribe = () => {
    toast({
      title: "Welcome to DopaMINE",
      description: "Full access unlocked. Let's meet Mojo.",
    });
    setCurrentScreen('atlas');
  };

  const handleClaimStreak = () => {
    const success = claimDailyStreak();
    if (success) {
      toast({
        title: `🔥 Day ${streak + 1} streak!`,
        description: "+20 Charge earned for daily check-in",
      });
    }
    return success;
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
          onContinue={() => setCurrentScreen('paywall')} 
        />
      )}
      {currentScreen === 'paywall' && (
        <PaywallScreen 
          onSubscribe={handleSubscribe}
          onSkip={() => setCurrentScreen('atlas')}
        />
      )}
      {currentScreen === 'atlas' && (
        <AtlasIntroScreen onContinue={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'home' && (
        <HomeScreen 
          selectedMirrors={selectedMirrors}
          onSelectMirror={handleMirrorSelect}
          chargeBalance={balance}
          stats={stats}
          streak={streak}
          streakClaimedToday={streakClaimedToday}
          reactionLeaderboard={reactionLeaderboard}
          onOpenExchange={() => setCurrentScreen('exchange')}
          onOpenInsights={() => setCurrentScreen('insights')}
          onOpenLearn={() => setCurrentScreen('learn')}
          onEarnCharge={earnCharge}
          onClaimStreak={handleClaimStreak}
          onRecordReaction={recordReactionTime}
        />
      )}
      {currentScreen === 'exchange' && (
        <AllocateScreen
          balance={balance}
          activeSession={activeSession}
          onEarn={earnCharge}
          onAllocate={allocateCharge}
          onCompleteSession={completeSession}
          onBack={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'insights' && (
        <InsightsScreen
          answers={assessmentAnswers}
          chargeBalance={balance}
          stats={stats}
          onBack={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'learn' && (
        <EducationSwiper
          onClose={() => setCurrentScreen('home')}
          onEarnCharge={earnCharge}
        />
      )}
    </div>
  );
};

export default Index;
