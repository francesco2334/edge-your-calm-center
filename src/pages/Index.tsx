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
import { ResetScreen } from '@/components/ResetScreen';
import { ActScreen } from '@/components/ActScreen';
import { ProgressScreen } from '@/components/ProgressScreen';
import { GamesScreen } from '@/components/GamesScreen';
import { LearnFeed } from '@/components/LearnFeed';
import { FlowNav } from '@/components/FlowNav';
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
import type { FlowStage } from '@/lib/credit-data';

type AppScreen = 'welcome' | 'permission' | 'assessment' | 'results' | 'authgate' | 'subscription' | 'atlas' | 'main';
type QuickTool = 'pause' | 'name' | 'prediction' | 'breathing' | null;
type FailureContext = 'game-loss' | 'streak-break' | 'relapse' | null;

const Index = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
  const [activeStage, setActiveStage] = useState<FlowStage>('reset'); // Reset is now the primary stage
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
  
  // Token economy system (internally still "tokens" but displayed as "credits")
  const { 
    tokens: credits, // Rename for UI
    points,
    streak,
    stats,
    activeSession,
    hasLoggedToday,
    isLoaded: economyLoaded,
    tokenTransactions: creditTransactions,
    learnCardsTowardsToken: learnCardsTowardsCredit,
    LEARN_CARDS_PER_TOKEN: LEARN_CARDS_PER_CREDIT,
    MINUTES_PER_TOKEN: MINUTES_PER_CREDIT,
    logDailyPull,
    recordLearnCard,
    recordGameComplete,
    recordGameFail,
    spendTokens: spendCredits,
    endSession,
    exitSessionEarly,
    logProductivity: logAction,
    productivityLogsToday: actionsToday,
    productivityLogsRemaining: actionsRemaining,
  } = useTokenEconomy(user?.id ?? null);

  // Progress Engine (for reflections, trophies - separate from economy)
  const {
    monthlyScores,
    monthlyNotes,
    monthlySummaries,
    trophies,
    totalDaysActive,
    hasWeeklyReflection,
    hasMonthlySummary,
    getMonthlyNote,
    submitWeeklyReflection,
    submitMonthlySummary,
    saveMonthlyNote,
    recordActivity,
    recordDailyActivity,
  } = useProgress();

  // Onboarding system
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
    resetTrial,
  } = useSubscription(user?.id);

  // Push notifications
  const { 
    scheduleTimeExpiredNotification, 
    cancelTimeExpiredNotification,
    scheduleStreakWarningNotification,
    cancelStreakWarning,
    scheduleTrophyProgressNotification,
    sendTrophyEarnedNotification,
    scheduleDailyReminderNotification,
    cancelDailyReminder,
    permission: notificationPermission,
  } = usePushNotifications();

  // Schedule streak warning if user hasn't logged today
  useEffect(() => {
    if (!hasLoggedToday && notificationPermission === 'granted') {
      scheduleStreakWarningNotification(12);
      scheduleDailyReminderNotification(20);
    } else if (hasLoggedToday) {
      cancelStreakWarning();
      cancelDailyReminder();
    }
  }, [hasLoggedToday, notificationPermission, scheduleStreakWarningNotification, cancelStreakWarning, scheduleDailyReminderNotification, cancelDailyReminder]);

  // Check trophy progress on mount
  useEffect(() => {
    if (notificationPermission === 'granted' && totalDaysActive > 0) {
      const trophyTypes = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'] as const;
      const thresholds = [60, 120, 180, 240, 300, 365];
      
      for (let i = 0; i < trophyTypes.length; i++) {
        const daysRemaining = thresholds[i] - totalDaysActive;
        if (daysRemaining > 0 && daysRemaining <= 7) {
          scheduleTrophyProgressNotification(daysRemaining, trophyTypes[i]);
          break;
        }
      }
    }
  }, [totalDaysActive, notificationPermission, scheduleTrophyProgressNotification]);

  // Determine initial screen
  useEffect(() => {
    if (authLoading || !economyLoaded || !onboardingLoaded || !subscriptionLoaded) return;
    
    if (!onboardingCompleted) {
      setCurrentScreen('welcome');
      return;
    }

    if (!authGateSeen) {
      setCurrentScreen('authgate');
      return;
    }

    setCurrentScreen('main');
  }, [user, authLoading, economyLoaded, onboardingLoaded, subscriptionLoaded, onboardingCompleted, authGateSeen]);

  // Show loading state
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

  // Handle daily pull logging
  const handlePullSelect = async (pullId: string) => {
    const awarded = logDailyPull(pullId);
    setCurrentTrigger(pullId);
    
    if (awarded) {
      cancelStreakWarning();
      cancelDailyReminder();
      
      const { newTrophies, nextTrophy } = recordDailyActivity();
      
      if (newTrophies.length > 0 && notificationPermission === 'granted') {
        for (const trophy of newTrophies) {
          await sendTrophyEarnedNotification(trophy.name, trophy.icon);
        }
      }
      
      if (nextTrophy && nextTrophy.daysRemaining <= 7 && notificationPermission === 'granted') {
        scheduleTrophyProgressNotification(nextTrophy.daysRemaining, nextTrophy.name);
      }
    }
    
    if (pullId !== 'none') {
      setShowTriggerRouting(true);
    }
    
    if (!hasAnsweredToday) {
      setTimeout(() => setShowDailyQuestion(true), 500);
    }
  };

  const handleRelapseLogged = () => {
    setFailureContext('relapse');
  };

  const handleGameComplete = (gameId: string, details: string) => {
    recordGameComplete(gameId as any, details);
    recordActivity('game', details, 10);
  };

  const handleGameFail = (gameId: string, reason: string) => {
    recordGameFail(gameId as any, reason);
    setFailureContext('game-loss');
  };

  const handleQuickToolComplete = (gameId: string, details: string) => {
    recordGameComplete(gameId as any, details);
    recordActivity('tool_used', details);
    setActiveQuickTool(null);
    // Return to reset stage after completing a tool
    setActiveStage('reset');
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

  const handleStageChange = (stage: FlowStage) => {
    setActiveStage(stage);
  };

  // Handle reset tool selection
  const handleStartReset = (type: 'quick' | 'sync' | 'name' | 'standoff') => {
    const toolMap: Record<string, QuickTool> = {
      quick: 'pause',
      sync: 'breathing',
      name: 'name',
      standoff: 'pause',
    };
    setActiveQuickTool(toolMap[type]);
  };

  // Handle spending credits for time
  const handleSpendCredits = async (creditCount: number, activity: string) => {
    const session = await spendCredits(creditCount, activity);
    if (session) {
      scheduleTimeExpiredNotification(activity, session.expiresAt);
      setActiveStage('reset');
    }
  };

  const handleSessionEnd = () => {
    setShowTimeExpired(true);
    endSession();
  };

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

  // Subscription expired
  if (subscriptionStatus === 'expired') {
    return (
      <TrialExpiredScreen 
        onSubscribe={() => {
          toast({
            title: "Coming soon",
            description: "Premium subscriptions launching soon!",
          });
        }}
        onResetTrial={() => {
          resetTrial();
          startTrial();
        }}
      />
    );
  }

  // Onboarding screens
  if (currentScreen !== 'main') {
    return (
      <div className="min-h-screen bg-background safe-area-inset">
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
            onContinue={() => {
              completeOnboarding();
              setCurrentScreen('authgate');
            }} 
          />
        )}
        {currentScreen === 'authgate' && (
          <AuthGateScreen 
            onContinue={() => {
              completeAuthGate();
              setCurrentScreen('subscription');
            }}
            onSignedIn={() => {
              completeAuthGate();
              setCurrentScreen('subscription');
            }}
          />
        )}
        {currentScreen === 'subscription' && (
          <SubscriptionScreen 
            onSubscribed={() => {
              startTrial();
              setCurrentScreen('atlas');
            }}
            onSkip={() => {
              setCurrentScreen('atlas');
            }}
          />
        )}
        {currentScreen === 'atlas' && (
          <AtlasIntroScreen onContinue={() => setCurrentScreen('main')} />
        )}
      </div>
    );
  }

  // Learn stage - TikTok style fullscreen swipe feed
  if (activeStage === 'learn') {
    return (
      <div className="min-h-screen bg-background">
        <LearnFeed 
          onClose={() => setActiveStage('reset')}
          onCardViewed={() => {
            recordLearnCard();
            recordActivity('learn', 'Card viewed', 2);
          }}
          onCardSaved={() => recordActivity('learn', 'Card saved', 5)}
        />
        <FlowNav
          activeStage={activeStage}
          onStageChange={handleStageChange}
          hasLoggedToday={hasLoggedToday}
        />
      </div>
    );
  }

  // Main app with flow-based navigation
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

      {/* Flow stages - New navigation structure */}
      {activeStage === 'log' && (
        <HomeScreen 
          credits={credits}
          points={points}
          streak={streak}
          hasLoggedToday={hasLoggedToday}
          trialDaysRemaining={subscriptionStatus === 'trial' ? trialDaysRemaining : undefined}
          currentTrigger={currentTrigger}
          onOpenReset={() => setActiveStage('reset')}
          onOpenMojoChat={() => setShowMojoChat(true)}
          onOpenQuickStop={() => setShowQuickStop(true)}
          onPullSelect={handlePullSelect}
          onRelapseLogged={handleRelapseLogged}
        />
      )}

      {activeStage === 'reset' && (
        <ResetScreen
          onStartReset={handleStartReset}
          onOpenMojo={() => setShowMojoChat(true)}
        />
      )}

      {activeStage === 'act' && (
        <ActScreen
          actionsToday={actionsToday}
          actionsRemaining={actionsRemaining}
          onLogAction={logAction}
        />
      )}
      
      {activeStage === 'progress' && (
        <ProgressScreen
          answers={assessmentAnswers}
          credits={credits}
          points={points}
          streak={streak}
          stats={stats}
          creditTransactions={creditTransactions}
          userId={user?.id}
          monthlyScores={monthlyScores}
          monthlyNotes={monthlyNotes}
          monthlySummaries={monthlySummaries}
          trophies={trophies}
          totalDaysActive={totalDaysActive}
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

      {/* Flow-based Navigation */}
      <FlowNav
        activeStage={activeStage}
        onStageChange={handleStageChange}
        hasLoggedToday={hasLoggedToday}
      />

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
          setActiveStage('log');
        }}
      />

      {/* Mojo Chat */}
      <MojoChat
        isOpen={showMojoChat}
        onClose={() => setShowMojoChat(false)}
        onTriggerTool={handleMojoTool}
        userId={user?.id}
      />

      {/* Trigger Routing */}
      <TriggerRouting
        isOpen={showTriggerRouting}
        onClose={() => setShowTriggerRouting(false)}
        trigger={currentTrigger}
        onLearnCard={() => setActiveStage('learn')}
        onGame={(gameId) => {
          // Games are now accessed through reset tools
          setActiveStage('reset');
        }}
        onMojo={() => setShowMojoChat(true)}
      />

      {/* Reset Without Shame Modal */}
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
