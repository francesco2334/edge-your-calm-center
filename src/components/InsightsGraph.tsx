import { motion } from 'framer-motion';
import { CATEGORY_LABELS, type CategoryScore } from '@/lib/token-data';
import { ASSESSMENT_QUESTIONS, type AssessmentAnswer } from '@/lib/edge-data';

interface InsightsGraphProps {
  answers: AssessmentAnswer[];
}

export function calculateCategoryScores(answers: AssessmentAnswer[]): CategoryScore[] {
  const categories = ['intensity', 'impulse', 'avoidance', 'risk', 'recovery'] as const;
  
  return categories.map(category => {
    const categoryQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === category);
    const categoryAnswers = answers.filter(a => 
      categoryQuestions.some(q => q.id === a.questionId)
    );
    
    const score = categoryAnswers.reduce((sum, a) => sum + a.value, 0);
    const maxScore = categoryQuestions.length * 4;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    
    const labels = CATEGORY_LABELS[category];
    const insight = percentage > 50 ? labels.highInsight : labels.lowInsight;
    
    return {
      category,
      label: labels.label,
      score,
      maxScore,
      percentage,
      insight,
    };
  });
}

export function InsightsGraph({ answers }: InsightsGraphProps) {
  const scores = calculateCategoryScores(answers);
  
  // Find strengths (low scores) and challenges (high scores)
  const sorted = [...scores].sort((a, b) => a.percentage - b.percentage);
  const strengths = sorted.filter(s => s.percentage <= 40);
  const challenges = sorted.filter(s => s.percentage > 60);

  const getBarColor = (percentage: number) => {
    if (percentage <= 25) return 'hsl(var(--primary))';
    if (percentage <= 50) return 'hsl(var(--dopa-warm))';
    if (percentage <= 75) return 'hsl(35, 80%, 55%)';
    return 'hsl(0, 65%, 55%)';
  };

  return (
    <div className="space-y-6">
      {/* Category bars */}
      <div className="space-y-4">
        {scores.map((score, i) => (
          <motion.div
            key={score.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground font-medium">{score.label}</span>
              <span className="text-muted-foreground">{Math.round(score.percentage)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score.percentage}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: getBarColor(score.percentage),
                  boxShadow: `0 0 10px ${getBarColor(score.percentage)}`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insights summary */}
      <div className="grid gap-4 mt-8">
        {/* Strengths */}
        {strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="dopa-card border-primary/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💪</span>
              <p className="text-sm font-medium text-primary">Your Strengths</p>
            </div>
            <div className="space-y-2">
              {strengths.map(s => (
                <p key={s.category} className="text-sm text-muted-foreground">
                  • {s.insight}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Challenges */}
        {challenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="dopa-card border-accent/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎯</span>
              <p className="text-sm font-medium text-accent">Focus Areas</p>
            </div>
            <div className="space-y-2">
              {challenges.map(s => (
                <p key={s.category} className="text-sm text-muted-foreground">
                  • {s.insight}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Neutral message if balanced */}
        {strengths.length === 0 && challenges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="dopa-card"
          >
            <p className="text-sm text-muted-foreground text-center">
              Your profile is balanced. Small adjustments can make a big difference.
            </p>
          </motion.div>
        )}
      </div>

      {/* Radar-style visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <RadarChart scores={scores} />
      </motion.div>
    </div>
  );
}

function RadarChart({ scores }: { scores: CategoryScore[] }) {
  const size = 200;
  const center = size / 2;
  const maxRadius = size / 2 - 20;
  const angleStep = (2 * Math.PI) / scores.length;
  
  // Calculate points for the data polygon
  const dataPoints = scores.map((score, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (score.percentage / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });
  
  const dataPath = dataPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Background rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background rings */}
        {rings.map((ring, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * ring}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}
        
        {/* Axis lines */}
        {scores.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + maxRadius * Math.cos(angle);
          const y2 = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}
        
        {/* Data polygon */}
        <motion.path
          d={dataPath}
          fill="hsl(var(--primary) / 0.2)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))',
          }}
        />
        
        {/* Data points */}
        {dataPoints.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9 + i * 0.05 }}
            style={{
              filter: 'drop-shadow(0 0 4px hsl(var(--primary)))',
            }}
          />
        ))}
        
        {/* Labels */}
        {scores.map((score, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = maxRadius + 15;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] fill-muted-foreground"
            >
              {score.label.split(' ')[0]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}