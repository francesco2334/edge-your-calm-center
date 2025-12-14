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
import { InsightsScreen } from '@/components/InsightsScreen';
import { LearnFeed } from '@/components/LearnFeed';
import { BottomNav } from '@/components/BottomNav';
import { QuickStopModal } from '@/components/QuickStopModal';
import { MojoChat, type MojoTool } from '@/components/MojoChat';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync } from '@/components/tools';
import { useCharge } from '@/hooks/useCharge';
import { useProgress } from '@/hooks/useProgress';
import { useTrial } from '@/hooks/useTrial';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentAnswer } from '@/lib/edge-data';

type AppScreen = 'welcome' | 'permission' | 'assessment' | 'results' | 'trial' | 'atlas' | 'main';
type MainTab = 'home' | 'learn' | 'quickstop' | 'games' | 'insights';
type QuickTool = 'pause' | 'name' | 'prediction' | 'breathing' | null;

const Index = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [showQuickStop, setShowQuickStop] = useState(false);
  const [showMojoChat, setShowMojoChat] = useState(false);
  const [showPullSheet, setShowPullSheet] = useState(false);
  const [activeQuickTool, setActiveQuickTool] = useState<QuickTool>(null);
  
  const { 
    balance, 
    transactions,
    earnCharge, 
    stats,
    streak,
    streakClaimedToday,
    reactionLeaderboard,
    claimDailyStreak,
    recordReactionTime,
    recordEarlyExit,
  } = useCharge(5);

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
  const { isActive: trialActive, hasAccepted: trialAccepted, daysRemaining, startTrial } = useTrial();

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
    toast({
      title: "Early exit",
      description: "-5 Charge deducted",
      variant: "destructive",
    });
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
          onOpenExchange={() => setActiveTab('games')}
          onEarnCharge={earnCharge}
          onClaimStreak={handleClaimStreak}
          onRecordReaction={recordReactionTime}
          onOpenMojoChat={() => setShowMojoChat(true)}
          onOpenQuickStop={() => setShowQuickStop(true)}
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
          transactions={transactions}
          onBack={() => setActiveTab('home')}
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
        onLogPull={() => setShowPullSheet(true)}
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
