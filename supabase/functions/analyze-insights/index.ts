import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BehaviorPatterns {
  intensity_seeking: number;
  impulse_control: number;
  avoidance_patterns: number;
  risk_chasing: number;
  recovery_speed: number;
}

interface FocusArea {
  title: string;
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, stats, transactions } = await req.json();

    // Analyze behavior patterns from stats
    const behaviorPatterns = analyzeBehaviorPatterns(stats, transactions);
    
    // Generate focus areas from patterns
    const focusAreas = generateFocusAreas(behaviorPatterns);
    
    // Extract themes from recent Mojo conversations
    const mojoThemes = extractMojoThemes(messages || []);

    // Save conversation if there are messages
    if (messages && messages.length > 0) {
      await supabase.from('mojo_conversations').insert({
        user_id: user.id,
        messages,
        themes: mojoThemes,
      });
    }

    // Update user progress with insights
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        behavior_patterns: behaviorPatterns,
        focus_areas: focusAreas,
        mojo_themes: mojoThemes,
        last_insight_update: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update insights:', updateError);
    }

    return new Response(JSON.stringify({
      behavior_patterns: behaviorPatterns,
      focus_areas: focusAreas,
      mojo_themes: mojoThemes,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('analyze-insights error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeBehaviorPatterns(stats: any, transactions: any[]): BehaviorPatterns {
  const patterns: BehaviorPatterns = {
    intensity_seeking: 50,
    impulse_control: 50,
    avoidance_patterns: 50,
    risk_chasing: 50,
    recovery_speed: 50,
  };

  if (!stats) return patterns;

  // Intensity seeking: based on session frequency and patterns
  const totalSessions = (stats.plannedSessions || 0);
  if (totalSessions > 0) {
    const overRatio = (stats.wentOver || 0) / totalSessions;
    patterns.intensity_seeking = Math.min(95, Math.round(50 + overRatio * 50));
  }

  // Impulse control: based on early exits vs went over
  if (totalSessions > 0) {
    const controlRatio = ((stats.earlyExits || 0) + (stats.stayedWithin || 0)) / totalSessions;
    patterns.impulse_control = Math.min(95, Math.round(controlRatio * 100));
  }

  // Avoidance patterns: based on stability run breaks
  const stabilityRatio = (stats.currentStabilityRun || 0) / Math.max(1, stats.longestStabilityRun || 1);
  patterns.avoidance_patterns = Math.min(95, Math.round(100 - stabilityRatio * 50));

  // Risk chasing: inverse of early exits
  if (totalSessions > 0) {
    const riskRatio = 1 - ((stats.earlyExits || 0) / totalSessions);
    patterns.risk_chasing = Math.min(95, Math.round(riskRatio * 100));
  }

  // Recovery speed: based on streak maintenance
  const recentAllocations = (transactions || [])
    .filter((t: any) => t.type === 'allocate')
    .slice(0, 10);
  const recentBonuses = (transactions || [])
    .filter((t: any) => t.type === 'bonus')
    .slice(0, 10);
  
  if (recentAllocations.length + recentBonuses.length > 0) {
    const recoveryRatio = recentBonuses.length / (recentAllocations.length + recentBonuses.length);
    patterns.recovery_speed = Math.min(95, Math.round(recoveryRatio * 100));
  }

  return patterns;
}

function generateFocusAreas(patterns: BehaviorPatterns): FocusArea[] {
  const areas: FocusArea[] = [];

  if (patterns.intensity_seeking > 60) {
    areas.push({
      title: 'High Intensity Seeking',
      description: 'Your system craves high-intensity input to feel normal.',
    });
  }

  if (patterns.impulse_control < 60) {
    areas.push({
      title: 'Impulse Management',
      description: 'Automatic responses often bypass conscious choice.',
    });
  }

  if (patterns.avoidance_patterns > 60) {
    areas.push({
      title: 'Avoidance Tendency',
      description: 'Content consumption may be displacing meaningful action.',
    });
  }

  if (patterns.risk_chasing > 70) {
    areas.push({
      title: 'Risk Threshold',
      description: 'The thrill of risk is pulling you beyond comfort.',
    });
  }

  if (patterns.recovery_speed < 50) {
    areas.push({
      title: 'Recovery Building',
      description: 'Focus on building consistent recovery patterns.',
    });
  }

  // Always return at least one area
  if (areas.length === 0) {
    areas.push({
      title: 'Balanced Profile',
      description: 'Your patterns show good self-regulation awareness.',
    });
  }

  return areas.slice(0, 4);
}

function extractMojoThemes(messages: any[]): string[] {
  const themes: string[] = [];
  const keywords: Record<string, string> = {
    'scroll': 'Screen Time',
    'phone': 'Device Usage',
    'social media': 'Social Media',
    'instagram': 'Social Media',
    'tiktok': 'Social Media',
    'youtube': 'Video Content',
    'gaming': 'Gaming',
    'game': 'Gaming',
    'focus': 'Focus Issues',
    'distract': 'Distraction',
    'procrastinat': 'Procrastination',
    'sleep': 'Sleep Patterns',
    'tired': 'Energy Levels',
    'anxious': 'Anxiety',
    'stress': 'Stress',
    'bored': 'Boredom',
    'impuls': 'Impulse Control',
    'habit': 'Habit Formation',
    'work': 'Work/Productivity',
    'study': 'Study/Learning',
  };

  const allText = messages
    .filter((m: any) => m.role === 'user')
    .map((m: any) => m.content.toLowerCase())
    .join(' ');

  for (const [keyword, theme] of Object.entries(keywords)) {
    if (allText.includes(keyword) && !themes.includes(theme)) {
      themes.push(theme);
    }
  }

  return themes.slice(0, 5);
}
