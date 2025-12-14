import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown, Minus, Trophy, BookOpen, Lightbulb } from 'lucide-react';
import type { MonthlyNote, MonthlySummary, MonthlyScore, Trophy as TrophyType } from '@/lib/progress-data';
import { getMonthLabel } from '@/lib/progress-data';

interface JourneyTimelineProps {
  monthlyNotes: MonthlyNote[];
  monthlySummaries: MonthlySummary[];
  monthlyScores: MonthlyScore[];
  trophies: TrophyType[];
}

interface MonthData {
  month: string;
  label: string;
  year: string;
  score?: MonthlyScore;
  note?: MonthlyNote;
  summary?: MonthlySummary;
  trophies: TrophyType[];
}

export function JourneyTimeline({ monthlyNotes, monthlySummaries, monthlyScores, trophies }: JourneyTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Combine all data by month and sort chronologically (newest first)
  const allMonths = new Set<string>();
  monthlyNotes.forEach(n => allMonths.add(n.month));
  monthlySummaries.forEach(s => allMonths.add(s.month));
  monthlyScores.forEach(s => allMonths.add(s.month));

  const monthsData: MonthData[] = Array.from(allMonths)
    .sort((a, b) => b.localeCompare(a)) // Newest first
    .map(month => {
      const [year, monthNum] = month.split('-');
      return {
        month,
        label: getMonthLabel(month),
        year,
        score: monthlyScores.find(s => s.month === month),
        note: monthlyNotes.find(n => n.month === month),
        summary: monthlySummaries.find(s => s.month === month),
        trophies: trophies.filter(t => t.month === month),
      };
    })
    .filter(m => m.note || m.summary || (m.score && m.score.score > 0)); // Only show months with activity

  const displayedMonths = isExpanded ? monthsData : monthsData.slice(0, 3);
  const hasMoreMonths = monthsData.length > 3;

  if (monthsData.length === 0) {
    return (
      <div className="dopa-card text-center py-8">
        <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Your journey timeline will appear here</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start using the app to build your history</p>
      </div>
    );
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-amber-400" />;
      default:
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Your Journey
        </h3>
        <span className="text-xs text-primary">{monthsData.length} months</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/30 to-transparent" />

        {/* Timeline items */}
        <div className="space-y-4">
          <AnimatePresence mode="sync">
            {displayedMonths.map((monthData, index) => (
              <motion.div
                key={monthData.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-10"
              >
                {/* Timeline dot */}
                <div className={`absolute left-2 top-3 w-4 h-4 rounded-full border-2 ${
                  index === 0 
                    ? 'bg-primary border-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]' 
                    : 'bg-muted border-border'
                }`} />

                {/* Month card */}
                <div className={`dopa-card ${index === 0 ? 'border border-primary/20' : ''}`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-foreground">{monthData.label}</span>
                      <span className="text-xs text-muted-foreground">{monthData.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {monthData.score && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                          <span className="text-xs font-medium text-foreground">{monthData.score.score}</span>
                          <span className="text-[10px] text-muted-foreground">pts</span>
                          {monthData.summary && getTrendIcon(monthData.summary.trend)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  {monthData.score && monthData.score.activities > 0 && (
                    <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
                      <span>{monthData.score.activities} activities</span>
                      <span>{monthData.score.learnCards} cards</span>
                      <span>{monthData.score.streakDays} streak days</span>
                    </div>
                  )}

                  {/* Trophies */}
                  {monthData.trophies.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {monthData.trophies.map(trophy => (
                        <div
                          key={trophy.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20"
                          title={trophy.description}
                        >
                          <span className="text-sm">{trophy.icon}</span>
                          <span className="text-[10px] text-primary font-medium">{trophy.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Improvements */}
                  {monthData.note?.improvements && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] uppercase tracking-wide text-emerald-400 font-medium">Improvements</span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {monthData.note.improvements}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {monthData.note?.notes && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3 h-3 text-accent" />
                        <span className="text-[10px] uppercase tracking-wide text-accent font-medium">Notes</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {monthData.note.notes}
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  {monthData.summary?.content && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-sm text-muted-foreground italic line-clamp-3">
                        "{monthData.summary.content}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show more/less button */}
        {hasMoreMonths && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-4 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {monthsData.length - 3} more months
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
