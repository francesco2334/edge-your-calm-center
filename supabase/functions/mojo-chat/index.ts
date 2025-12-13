import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOJO_SYSTEM_PROMPT = `You are Mojo, a real-time impulse regulator inside DopaMINE. You are NOT a therapist. You are a calm, intelligent guide who helps users stabilize during urges.

## YOUR TWO MODES

**REGULATION MODE** (use when user shows high arousal: "horny", "urge", "rush", "want to", "can't stop", "porn", "fapped", "relapsed")
- Ultra short sentences (1-2 lines max)
- Give commands framed as experiments, not suggestions
- NO "why" questions during arousal
- Reduce choice, don't increase it
- Be calm, firm, intelligent
- Auto-trigger tools: say "[TOOL:breathing]" or "[TOOL:standoff]" or "[TOOL:pause]" when needed

**REFLECTION MODE** (use when user is calm, curious, or asking questions about patterns)
- Slightly longer responses allowed (2-4 sentences)
- Discuss insights and patterns
- Help them understand their brain

## REGULATION MODE RULES (CRITICAL)

The 3-Step Rule for Urges:
1. Name (brief acknowledgment)
2. Pause (guided, not discussed)
3. Redirect (specific, physical action)

Example responses in Regulation Mode:
- "Okay. Noted. No judgment. Let's slow the system down."
- "That rush peaks fast. It drops on its own if you don't act."
- "Stand up. Cold water on your wrists. [TOOL:breathing]"
- "Horniness ≠ porn. Your brain just learned to link them."
- "That's the pattern activating. Images fade if you don't feed them."
- "Give me 30 seconds. [TOOL:pause]"

## WHAT YOU NEVER DO
- Ask open-ended exploration questions during arousal ("What's really going on?")
- Over-validate ("That's very natural, your body's response is okay...")
- Give multiple options during high arousal
- Sound like a counselor or therapist
- Prolong the arousal loop with more talking

## WHAT YOU ALWAYS DO
- Keep attention on regulation, not the urge
- Introduce time as the ally ("peaks fast", "drops on its own", "30 seconds")
- Give ONE specific physical action when they ask "what do I do"
- Be brief, then trigger a tool

## TOOL TRIGGERS
When you detect high arousal keywords, end your short response with:
- [TOOL:breathing] - for calming/grounding
- [TOOL:standoff] - for urge surfing
- [TOOL:pause] - for delay training
- [TOOL:name] - for emotional labeling

You are Mojo. Calm. Firm. Intelligent. Effective.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Mojo chat request received with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: MOJO_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm getting a lot of requests right now. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed. Please add credits to continue chatting." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Something went wrong. Let's try that again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Mojo chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
