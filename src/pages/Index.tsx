import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PermissionScreen } from '@/components/PermissionScreen';
import { AssessmentScreen } from '@/components/AssessmentScreen';
import { ResultsScreen } from '@/components/ResultsScreen';
import { AtlasIntroScreen } from '@/components/AtlasIntroScreen';
import { AuthGateScreen } from '@/components/AuthGateScreen';
import { SubscriptionScreen } from '@/components/SubscriptionScreen';
import { TrialExpiredScreen } from '@/components/TrialExpiredScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { GamesScreen } from '@/components/GamesScreen';
import { ExchangeScreen } from '@/components/ExchangeScreen';
import { InsightsScreen } from '@/components/InsightsScreen';
import { ProductivityScreen } from '@/components/ProductivityScreen';
import { LearnFeed } from '@/components/LearnFeed';
import { BottomNav } from '@/components/BottomNav';
import { QuickStopModal } from '@/components/QuickStopModal';
import { MojoChat, type MojoTool } from '@/components/MojoChat';
import { ResetWithoutShameModal } from '@/components/ResetWithoutShameModal';
import { DailyQuestionPrompt } from '@/components/DailyQuestionPrompt';
import { TriggerRouting } from '@/components/TriggerRouting';
import { TimeSessionBanner, TimeExpiredModal } from '@/components/TimeSession';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync } from '@/components/tools';
import { useTokenEconomy } from '@/hooks/useTokenEconomy';
import { useProgress } from '@/hooks/useProgress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useDailyQuestion } from '@/hooks/useDailyQuestion';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentAnswer } from '@/lib/edge-data';

type AppScreen = 'welcome' | 'permission' | 'assessment' | 'results' | 'authgate' | 'subscription' | 'atlas' | 'main';
type MainTab = 'home' | 'learn' | 'games' | 'productivity' | 'insights' | 'exchange';
type QuickTool = 'pause' | 'name' | 'prediction' | 'breathing' | null;
type FailureContext = 'game-loss' | 'streak-break' | 'relapse' | null;

const Index = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [showQuickStop, setShowQuickStop] = useState(false);
  const [showMojoChat, setShowMojoChat] = useState(false);
  const [activeQuickTool, setActiveQuickTool] = useState<QuickTool>(null);
  const [failureContext, setFailureContext] = useState<FailureContext>(null);
  const [showDailyQuestion, setShowDailyQuestion] = useState(false);
  const [showTriggerRouting, setShowTriggerRouting] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<string | null>(null);
  const [showTimeExpired, setShowTimeExpired] = useState(false);
  
  // Daily question hook
  const { hasAnsweredToday } = useDailyQuestion();
  
  // NEW: Clean token economy system
  const { 
    tokens,
    points,
    streak,
    stats,
    activeSession,
    hasLoggedToday,
    isLoaded: economyLoaded,
    tokenTransactions,
    learnCardsTowardsToken,
    LEARN_CARDS_PER_TOKEN,
    MINUTES_PER_TOKEN,
    logDailyPull,
    recordLearnCard,
    recordGameComplete,
    recordGameFail,
    spendTokens,
    endSession,
    exitSessionEarly,
    logProductivity,
    productivityLogsToday,
    productivityLogsRemaining,
  } = useTokenEconomy(user?.id ?? null);

  // Progress Engine (for reflections, trophies - separate from economy)
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

  // Onboarding system - separate from trial/subscription
  const { 
    onboardingCompleted, 
    authGateSeen, 
    isLoaded: onboardingLoaded, 
    completeOnboarding, 
    completeAuthGate 
  } = useOnboarding(user?.id);

  // Subscription system
  const { 
    status: subscriptionStatus, 
    trialDaysRemaining, 
    isLoaded: subscriptionLoaded,
    startTrial,
  } = useSubscription(user?.id);

  // Push notifications - real local notifications on native
  const { 
    scheduleTimeExpiredNotification, 
    cancelTimeExpiredNotification,
    scheduleStreakWarningNotification,
    cancelStreakWarning,
    permission: notificationPermission,
  } = usePushNotifications();

  // Schedule streak warning if user hasn't logged today
  useEffect(() => {
    if (!hasLoggedToday && notificationPermission === 'granted') {
      scheduleStreakWarningNotification(12);
    } else if (hasLoggedToday) {
      cancelStreakWarning();
    }
  }, [hasLoggedToday, notificationPermission, scheduleStreakWarningNotification, cancelStreakWarning]);

  // Determine initial screen based on onboarding, auth, and subscription status
  // SINGLE SOURCE OF TRUTH for routing
  useEffect(() => {
    if (authLoading || !economyLoaded || !onboardingLoaded || !subscriptionLoaded) return;
    
    // Priority 1: Not completed onboarding yet → show onboarding flow
    if (!onboardingCompleted) {
      setCurrentScreen('welcome');
      return;
    }

    // Priority 2: Completed onboarding but hasn't seen auth gate → show auth gate
    if (!authGateSeen) {
      setCurrentScreen('authgate');
      return;
    }

    // Priority 3: User is authenticated or guest, go to main app
    setCurrentScreen('main');
  }, [user, authLoading, economyLoaded, onboardingLoaded, subscriptionLoaded, onboardingCompleted, authGateSeen]);

  // Show loading state while data loads
  if (authLoading || !economyLoaded || !onboardingLoaded || !subscriptionLoaded || currentScreen === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center safe-area-inset">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAssessmentComplete = (answers: AssessmentAnswer[]) => {
    setAssessmentAnswers(answers);
    setCurrentScreen('results');
  };

  // Handle daily pull logging - awards +3 tokens once per day
  const handlePullSelect = (pullId: string) => {
    const awarded = logDailyPull(pullId);
    setCurrentTrigger(pullId);
    
    // Cancel streak warning since user logged
    if (awarded) {
      cancelStreakWarning();
    }
    
    // Show trigger routing (helps based on what pulled them)
    if (pullId !== 'none') {
      setShowTriggerRouting(true);
    }
    
    // Show daily question if not answered
    if (!hasAnsweredToday) {
      setTimeout(() => setShowDailyQuestion(true), 500);
    }
  };

  // Handle relapse-type pulls
  const handleRelapseLogged = () => {
    setFailureContext('relapse');
  };

  // Handle game completion - awards +1 token + points
  const handleGameComplete = (gameId: string, details: string) => {
    recordGameComplete(gameId as any, details);
    recordActivity('game', details, 10);
  };

  // Handle game failure/early exit - deducts points ONLY, never tokens
  const handleGameFail = (gameId: string, reason: string) => {
    recordGameFail(gameId as any, reason);
    setFailureContext('game-loss');
  };

  // Handle quick tool completion
  const handleQuickToolComplete = (gameId: string, details: string) => {
    recordGameComplete(gameId as any, details);
    recordActivity('tool_used', details);
    setActiveQuickTool(null);
  };

  const handleWeeklyReflection = (prompts: any) => {
    submitWeeklyReflection(prompts);
    toast({
      title: "Reflection saved",
      description: "Your weekly reflection has been recorded.",
    });
  };

  const handleMonthlySummary = (content: string) => {
    submitMonthlySummary(content);
    toast({
      title: "Monthly summary saved",
      description: "Your monthly insights have been recorded.",
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

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
  };

  // Handle spending tokens for time
  const handleSpendTokens = async (tokenCount: number, activity: string) => {
    const session = await spendTokens(tokenCount, activity);
    if (session) {
      // Schedule real local notification for when time expires
      scheduleTimeExpiredNotification(activity, session.expiresAt);
      setActiveTab('home'); // Go back to home, show timer
    }
  };

  // Handle session end
  const handleSessionEnd = () => {
    setShowTimeExpired(true);
    endSession();
  };

  // Handle early exit - cancel the scheduled notification
  const handleExitEarly = () => {
    cancelTimeExpiredNotification();
    exitSessionEarly();
  };

  // Render quick tool fullscreen
  if (activeQuickTool === 'pause') {
    return (
      <PauseLadder 
        onComplete={(s) => handleQuickToolComplete('standoff', `Standoff: ${s}s`)}
        onCancel={() => {
          handleGameFail('standoff', 'Early exit');
          setActiveQuickTool(null);
        }}
      />
    );
  }
  if (activeQuickTool === 'name') {
    return (
      <NameThePull 
        onComplete={(f) => handleQuickToolComplete('nameIt', `Named: ${f}`)}
        onCancel={() => {
          handleGameFail('nameIt', 'Early exit');
          setActiveQuickTool(null);
        }}
      />
    );
  }
  if (activeQuickTool === 'prediction') {
    return (
      <PredictionReality 
        onComplete={(p, r) => handleQuickToolComplete('bluff', `Bluff: ${p}→${r}`)}
        onCancel={() => {
          handleGameFail('bluff', 'Early exit');
          setActiveQuickTool(null);
        }}
      />
    );
  }
  if (activeQuickTool === 'breathing') {
    return (
      <BreathingSync 
        onComplete={() => handleQuickToolComplete('sync', 'Sync complete')}
        onCancel={() => {
          handleGameFail('sync', 'Early exit');
          setActiveQuickTool(null);
        }}
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
          onCardViewed={() => {
            recordLearnCard();
            recordActivity('learn', 'Card viewed', 2);
          }}
          onCardSaved={() => recordActivity('learn', 'Card saved', 5)}
        />
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    );
  }

  // Main app with bottom nav
  return (
    <div className="min-h-screen bg-background">
      {/* Active time session banner */}
      {activeSession && (
        <TimeSessionBanner
          session={activeSession}
          onEndSession={handleSessionEnd}
          onExitEarly={handleExitEarly}
        />
      )}

      {activeTab === 'home' && (
        <HomeScreen 
          tokens={tokens}
          points={points}
          streak={streak}
          hasLoggedToday={hasLoggedToday}
          trialDaysRemaining={trialActive ? daysRemaining : undefined}
          currentTrigger={currentTrigger}
          onOpenExchange={() => setActiveTab('exchange')}
          onOpenMojoChat={() => setShowMojoChat(true)}
          onOpenQuickStop={() => setShowQuickStop(true)}
          onPullSelect={handlePullSelect}
          onRelapseLogged={handleRelapseLogged}
        />
      )}
      
      {activeTab === 'exchange' && (
        <ExchangeScreen
          tokens={tokens}
          minutesPerToken={MINUTES_PER_TOKEN}
          onSpendTokens={handleSpendTokens}
          onBack={() => setActiveTab('home')}
        />
      )}

      {activeTab === 'games' && (
        <GamesScreen
          onGameComplete={handleGameComplete}
          onGameFail={handleGameFail}
        />
      )}
      
      {activeTab === 'insights' && (
        <InsightsScreen
          answers={assessmentAnswers}
          tokens={tokens}
          points={points}
          streak={streak}
          stats={stats}
          tokenTransactions={tokenTransactions}
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

      {activeTab === 'productivity' && (
        <ProductivityScreen
          logsToday={productivityLogsToday}
          logsRemaining={productivityLogsRemaining}
          onLogProductivity={logProductivity}
        />
      )}

      {/* Bottom Navigation */}
      {activeTab !== 'exchange' && (
        <BottomNav
          activeTab={activeTab as 'home' | 'learn' | 'games' | 'productivity' | 'insights'}
          onTabChange={handleTabChange}
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
        onLogPull={() => {
          setShowQuickStop(false);
          // This will be handled by HomeScreen
        }}
      />

      {/* Mojo Chat */}
      <MojoChat
        isOpen={showMojoChat}
        onClose={() => setShowMojoChat(false)}
        onTriggerTool={handleMojoTool}
        userId={user?.id}
      />

      {/* Trigger Routing - shows relevant content after logging */}
      <TriggerRouting
        isOpen={showTriggerRouting}
        onClose={() => setShowTriggerRouting(false)}
        trigger={currentTrigger}
        onLearnCard={() => setActiveTab('learn')}
        onGame={(gameId) => {
          setActiveTab('games');
          // TODO: Auto-start specific game
        }}
        onMojo={() => setShowMojoChat(true)}
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

      {/* Time Expired Modal */}
      {showTimeExpired && (
        <TimeExpiredModal onClose={() => setShowTimeExpired(false)} />
      )}
    </div>
  );
};

export default Index;
