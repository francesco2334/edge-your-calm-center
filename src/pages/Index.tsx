import { useState } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PermissionScreen } from '@/components/PermissionScreen';
import { AssessmentScreen } from '@/components/AssessmentScreen';
import { ResultsScreen } from '@/components/ResultsScreen';
import { PaywallScreen } from '@/components/PaywallScreen';
import { AtlasIntroScreen } from '@/components/AtlasIntroScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { GamesScreen } from '@/components/GamesScreen';
import { AllocateScreen } from '@/components/AllocateScreen';
import { InsightsScreen } from '@/components/InsightsScreen';
import { LearnFeed } from '@/components/LearnFeed';
import { BottomNav } from '@/components/BottomNav';
import { QuickStopModal } from '@/components/QuickStopModal';
import { MojoChat, type MojoTool } from '@/components/MojoChat';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync } from '@/components/tools';
import { useCharge } from '@/hooks/useCharge';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentAnswer } from '@/lib/edge-data';

type AppScreen = 'welcome' | 'permission' | 'assessment' | 'results' | 'paywall' | 'atlas' | 'main';
type MainTab = 'home' | 'learn' | 'quickstop' | 'games' | 'insights';
type QuickTool = 'pause' | 'name' | 'prediction' | 'breathing' | null;

const Index = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [showQuickStop, setShowQuickStop] = useState(false);
  const [showMojoChat, setShowMojoChat] = useState(false);
  const [activeQuickTool, setActiveQuickTool] = useState<QuickTool>(null);
  
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

  const handleQuickToolComplete = (charge: number, reason: string) => {
    earnCharge(charge, reason);
    setActiveQuickTool(null);
    toast({
      title: "Well done",
      description: `+${charge} Charge earned`,
    });
  };

  const handleMojoTool = (tool: MojoTool) => {
    setShowMojoChat(false);
    // Map Mojo tool names to quick tool names
    const toolMap: Record<MojoTool, QuickTool> = {
      breathing: 'breathing',
      standoff: 'pause',
      pause: 'pause',
      name: 'name',
    };
    setActiveQuickTool(toolMap[tool]);
  };

  const handleTabChange = (tab: MainTab) => {
    if (tab === 'quickstop') {
      setShowQuickStop(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Render quick tool fullscreen
  if (activeQuickTool === 'pause') {
    return (
      <PauseLadder 
        onComplete={(s) => handleQuickToolComplete(s >= 40 ? 2 : 1, `Standoff: ${s}s`)}
        onCancel={() => setActiveQuickTool(null)}
      />
    );
  }
  if (activeQuickTool === 'name') {
    return (
      <NameThePull 
        onComplete={(f) => handleQuickToolComplete(1, `Named: ${f}`)}
        onCancel={() => setActiveQuickTool(null)}
      />
    );
  }
  if (activeQuickTool === 'prediction') {
    return (
      <PredictionReality 
        onComplete={(p, r) => handleQuickToolComplete(1, `Bluff: ${p}→${r}`)}
        onCancel={() => setActiveQuickTool(null)}
      />
    );
  }
  if (activeQuickTool === 'breathing') {
    return (
      <BreathingSync 
        onComplete={() => handleQuickToolComplete(2, 'Sync complete')}
        onCancel={() => setActiveQuickTool(null)}
      />
    );
  }

  // Onboarding screens
  if (currentScreen !== 'main') {
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
          <AtlasIntroScreen onContinue={() => setCurrentScreen('main')} />
        )}
      </div>
    );
  }

  // Learn tab - TikTok style fullscreen swipe feed
  if (activeTab === 'learn') {
    return (
      <div className="min-h-screen bg-background">
        <LearnFeed onClose={() => setActiveTab('home')} />
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onQuickStop={() => setShowQuickStop(true)}
        />
      </div>
    );
  }

  // Main app with bottom nav
  return (
    <div className="min-h-screen bg-background">
      {activeTab === 'home' && (
        <HomeScreen 
          chargeBalance={balance}
          stats={stats}
          streak={streak}
          streakClaimedToday={streakClaimedToday}
          reactionLeaderboard={reactionLeaderboard}
          onOpenExchange={() => setActiveTab('games')}
          onEarnCharge={earnCharge}
          onClaimStreak={handleClaimStreak}
          onRecordReaction={recordReactionTime}
          onOpenMojoChat={() => setShowMojoChat(true)}
        />
      )}
      
      {activeTab === 'games' && (
        <GamesScreen
          reactionLeaderboard={reactionLeaderboard}
          onEarnCharge={earnCharge}
          onRecordReaction={recordReactionTime}
        />
      )}
      
      {activeTab === 'insights' && (
        <InsightsScreen
          answers={assessmentAnswers}
          chargeBalance={balance}
          stats={stats}
          onBack={() => setActiveTab('home')}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onQuickStop={() => setShowQuickStop(true)}
      />

      {/* Quick Stop Modal */}
      <QuickStopModal
        isOpen={showQuickStop}
        onClose={() => setShowQuickStop(false)}
        onSelectTool={(tool) => {
          setShowQuickStop(false);
          setActiveQuickTool(tool);
        }}
      />

      {/* Mojo Chat */}
      <MojoChat
        isOpen={showMojoChat}
        onClose={() => setShowMojoChat(false)}
        onTriggerTool={handleMojoTool}
      />
    </div>
  );
};

export default Index;
