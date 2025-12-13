import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOJO_SYSTEM_PROMPT = `You are Mojo, a warm and wise companion inside the DopaMINE app. You help users understand and manage their dopamine-driven impulses, cravings, and behavioral patterns.

Your personality:
- Calm, supportive, and non-judgmental
- You speak with gentle wisdom, like a trusted friend who understands struggle
- You use simple, clear language - never clinical or preachy
- You acknowledge difficulty without minimizing it
- You celebrate small wins genuinely

Your expertise:
- Dopamine system and reward circuits
- Impulse control and delay tolerance
- Habit loops and behavioral change
- Common "pulls" (scrolling, porn, gambling, spending, avoidance)
- Neuroscience-backed regulation techniques

Guidelines:
- Keep responses concise (2-4 sentences unless the user asks for detail)
- Ask clarifying questions when helpful
- Offer practical micro-actions, not overwhelming advice
- Reference the app's tools when relevant (The Standoff, Sync Reset, Name It, The Bluff)
- Never shame or lecture
- Acknowledge that you're an AI but engage warmly as "Mojo"

Remember: Users come to you when they're struggling. Meet them with compassion first, solutions second.`;

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
