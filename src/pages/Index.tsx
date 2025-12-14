import { useState } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PermissionScreen } from '@/components/PermissionScreen';
import { AssessmentScreen } from '@/components/AssessmentScreen';
import { ResultsScreen } from '@/components/ResultsScreen';
import { AtlasIntroScreen } from '@/components/AtlasIntroScreen';
import { TrialScreen } from '@/components/TrialScreen';
import { TrialExpiredScreen } from '@/components/TrialExpiredScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { GamesScreen } from '@/components/GamesScreen';
import { ExchangeScreen } from '@/components/ExchangeScreen';
import { InsightsScreen } from '@/components/InsightsScreen';
import { LearnFeed } from '@/components/LearnFeed';
import { BottomNav } from '@/components/BottomNav';
import { QuickStopModal } from '@/components/QuickStopModal';
import { MojoChat, type MojoTool } from '@/components/MojoChat';
import { ResetWithoutShameModal } from '@/components/ResetWithoutShameModal';
import { DailyQuestionPrompt } from '@/components/DailyQuestionPrompt';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync } from '@/components/tools';
import { usePersistedCharge } from '@/hooks/usePersistedCharge';
import { useProgress } from '@/hooks/useProgress';
import { useTrial } from '@/hooks/useTrial';
import { useAuth } from '@/hooks/useAuth';
import { useDailyQuestion } from '@/hooks/useDailyQuestion';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentAnswer } from '@/lib/edge-data';

type AppScreen = 'welcome' | 'permission' | 'assessment' | 'results' | 'trial' | 'atlas' | 'main';
type MainTab = 'home' | 'learn' | 'quickstop' | 'games' | 'insights' | 'exchange';
type QuickTool = 'pause' | 'name' | 'prediction' | 'breathing' | null;
type FailureContext = 'game-loss' | 'streak-break' | 'relapse' | null;

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [showQuickStop, setShowQuickStop] = useState(false);
  const [showMojoChat, setShowMojoChat] = useState(false);
  const [showPullSheet, setShowPullSheet] = useState(false);
  const [activeQuickTool, setActiveQuickTool] = useState<QuickTool>(null);
  const [failureContext, setFailureContext] = useState<FailureContext>(null);
  const [showDailyQuestion, setShowDailyQuestion] = useState(false);
  
  // Daily question hook
  const { hasAnsweredToday } = useDailyQuestion();
  
  const { 
    balance, 
    transactions,
    earnCharge, 
    stats,
    streak,
    streakClaimedToday,
    reactionLeaderboard,
    isLoaded: chargeLoaded,
    claimDailyStreak,
    recordReactionTime,
    recordEarlyExit,
  } = usePersistedCharge(user?.id ?? null, 5);

  // Progress Engine
  const {
    monthlyScores,
    monthlyNotes,
    monthlySummaries,
    trophies,
    hasWeeklyReflection,
    hasMonthlySummary,
    getMonthlyNote,
    submitWeeklyReflection,
    submitMonthlySummary,
    saveMonthlyNote,
    recordActivity,
  } = useProgress();

  // Trial system
  const { isActive: trialActive, hasAccepted: trialAccepted, daysRemaining, isLoaded: trialLoaded, startTrial } = useTrial(user?.id);

  // Show loading state while data loads
  if (!chargeLoaded || !trialLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAssessmentComplete = (answers: AssessmentAnswer[]) => {
    setAssessmentAnswers(answers);
    setCurrentScreen('results');
  };
  const handleClaimStreak = () => {
    const success = claimDailyStreak();
    if (success) {
      recordActivity('streak', 'Daily streak claimed');
      toast({
        title: `🔥 Day ${streak + 1} streak!`,
        description: "+20 Charge earned for daily check-in",
      });
    }
    return success;
  };

  const handleQuickToolComplete = (charge: number, reason: string) => {
    earnCharge(charge, reason);
    recordActivity('tool_used', reason);
    setActiveQuickTool(null);
    toast({
      title: "Well done",
      description: `+${charge} Charge earned`,
    });
  };

  const handleWeeklyReflection = (prompts: any) => {
    submitWeeklyReflection(prompts);
    earnCharge(25, 'Weekly reflection');
    toast({
      title: "Reflection saved",
      description: "+25 Charge earned",
    });
  };

  const handleMonthlySummary = (content: string) => {
    submitMonthlySummary(content);
    earnCharge(50, 'Monthly summary');
    toast({
      title: "Monthly summary saved",
      description: "+50 Charge earned",
    });
  };

  const handleMojoTool = (tool: MojoTool) => {
    setShowMojoChat(false);
    recordActivity('mojo_chat', `Mojo tool: ${tool}`, 8);
    const toolMap: Record<MojoTool, QuickTool> = {
      breathing: 'breathing',
      standoff: 'pause',
      pause: 'pause',
      name: 'name',
    };
    setActiveQuickTool(toolMap[tool]);
  };

  const handleGameComplete = (charge: number, reason: string) => {
    earnCharge(charge, reason);
    recordActivity('game', reason, 20);
  };

  const handleTabChange = (tab: MainTab) => {
    if (tab === 'quickstop') {
      setShowQuickStop(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleEarlyExit = (toolName: string) => {
    recordEarlyExit(toolName);
    setActiveQuickTool(null);
    // Show failure protocol modal instead of just a toast
    setFailureContext('game-loss');
  };

  // Handle pull selection with daily question prompt
  const handlePullLogged = () => {
    // Show daily question if not answered today
    if (!hasAnsweredToday) {
      setTimeout(() => setShowDailyQuestion(true), 500);
    }
  };

  // Handle relapse-type pulls
  const handleRelapseLogged = () => {
    setFailureContext('relapse');
  };

  // Render quick tool fullscreen
  if (activeQuickTool === 'pause') {
    return (
      <PauseLadder 
        onComplete={(s) => handleQuickToolComplete(s >= 40 ? 2 : 1, `Standoff: ${s}s`)}
        onCancel={() => handleEarlyExit('The Standoff')}
      />
    );
  }
  if (activeQuickTool === 'name') {
    return (
      <NameThePull 
        onComplete={(f) => handleQuickToolComplete(1, `Named: ${f}`)}
        onCancel={() => handleEarlyExit('Name It')}
      />
    );
  }
  if (activeQuickTool === 'prediction') {
    return (
      <PredictionReality 
        onComplete={(p, r) => handleQuickToolComplete(1, `Bluff: ${p}→${r}`)}
        onCancel={() => handleEarlyExit('The Bluff')}
      />
    );
  }
  if (activeQuickTool === 'breathing') {
    return (
      <BreathingSync 
        onComplete={() => handleQuickToolComplete(2, 'Sync complete')}
        onCancel={() => handleEarlyExit('Sync')}
      />
    );
  }

  // Trial expired - show subscription screen
  if (trialAccepted && !trialActive) {
    return (
      <TrialExpiredScreen 
        onSubscribe={() => {
          toast({
            title: "Coming soon",
            description: "Premium subscriptions launching soon!",
          });
        }}
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
            onContinue={() => setCurrentScreen('trial')} 
          />
        )}
        {currentScreen === 'trial' && (
          <TrialScreen 
            onAccept={() => {
              startTrial();
              setCurrentScreen('atlas');
            }}
            daysRemaining={7}
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
        <LearnFeed 
          onClose={() => setActiveTab('home')}
          onCardViewed={() => recordActivity('learn', 'Card viewed', 2)}
          onCardSaved={() => recordActivity('learn', 'Card saved', 5)}
        />
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
          trialDaysRemaining={trialActive ? daysRemaining : undefined}
          onOpenExchange={() => setActiveTab('exchange')}
          onEarnCharge={earnCharge}
          onClaimStreak={handleClaimStreak}
          onRecordReaction={recordReactionTime}
          onOpenMojoChat={() => setShowMojoChat(true)}
          onOpenQuickStop={() => setShowQuickStop(true)}
          onPullLogged={handlePullLogged}
          onRelapseLogged={handleRelapseLogged}
        />
      )}
      
      {activeTab === 'exchange' && (
        <ExchangeScreen
          balance={balance}
          onEarn={(amount, reason) => {
            earnCharge(amount, reason);
            recordActivity('game', reason, 5);
          }}
          onSpend={(amount, reason) => {
            earnCharge(-amount, reason);
            recordActivity('game', reason, 5);
            return true;
          }}
          onBack={() => setActiveTab('home')}
        />
      )}

      {activeTab === 'games' && (
        <GamesScreen
          reactionLeaderboard={reactionLeaderboard}
          onEarnCharge={(charge, reason) => {
            earnCharge(charge, reason);
            recordActivity('game', reason, 10);
          }}
          onRecordReaction={recordReactionTime}
          onEarlyExit={recordEarlyExit}
        />
      )}
      
      {activeTab === 'insights' && (
        <InsightsScreen
          answers={assessmentAnswers}
          chargeBalance={balance}
          stats={stats}
          streak={streak}
          transactions={transactions}
          onBack={() => setActiveTab('home')}
          userId={user?.id}
          monthlyScores={monthlyScores}
          monthlyNotes={monthlyNotes}
          monthlySummaries={monthlySummaries}
          trophies={trophies}
          hasWeeklyReflection={hasWeeklyReflection()}
          hasMonthlySummary={hasMonthlySummary()}
          monthlyNote={getMonthlyNote()}
          onWeeklyReflection={handleWeeklyReflection}
          onMonthlySummary={handleMonthlySummary}
          onSaveMonthlyNote={(improvements, notes) => {
            saveMonthlyNote(improvements, notes);
            toast({
              title: "Notes saved",
              description: "Your monthly improvements have been recorded.",
            });
          }}
        />
      )}

      {/* Bottom Navigation */}
      {activeTab !== 'exchange' && (
        <BottomNav
          activeTab={activeTab as 'home' | 'learn' | 'quickstop' | 'games' | 'insights'}
          onTabChange={handleTabChange}
          onQuickStop={() => setShowQuickStop(true)}
        />
      )}

      {/* Quick Stop Modal */}
      <QuickStopModal
        isOpen={showQuickStop}
        onClose={() => setShowQuickStop(false)}
        onSelectTool={(tool) => {
          setShowQuickStop(false);
          setActiveQuickTool(tool);
        }}
        onLogPull={() => setShowPullSheet(true)}
      />

      {/* Mojo Chat */}
      <MojoChat
        isOpen={showMojoChat}
        onClose={() => setShowMojoChat(false)}
        onTriggerTool={handleMojoTool}
        userId={user?.id}
      />

      {/* Reset Without Shame Modal - Failure Protocol */}
      <ResetWithoutShameModal
        isOpen={failureContext !== null}
        onClose={() => setFailureContext(null)}
        onBreathing={() => {
          setFailureContext(null);
          setActiveQuickTool('breathing');
        }}
        onMojo={() => {
          setFailureContext(null);
          setShowMojoChat(true);
        }}
        context={failureContext || 'relapse'}
      />

      {/* Daily Question Prompt */}
      <DailyQuestionPrompt
        isOpen={showDailyQuestion}
        onClose={() => setShowDailyQuestion(false)}
      />
    </div>
  );
};

export default Index;
