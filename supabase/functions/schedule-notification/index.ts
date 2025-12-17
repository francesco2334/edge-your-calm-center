import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * NOTIFICATION SCHEDULER
 * 
 * Allowed notification types:
 * 1. STREAK WARNING: User hasn't logged today, streak expires soon
 * 2. TIME EXPIRED: Purchased time session has ended - encourage earning more
 * 3. TROPHY PROGRESS: Close to earning a new trophy milestone
 * 4. TROPHY EARNED: User just earned a trophy
 * 
 * NO marketing notifications
 * NO engagement pings
 * NO random reminders
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "streak-warning" | "time-expired" | "trophy-progress" | "trophy-earned";
  userId: string;
  scheduledFor?: string; // ISO timestamp for when to send
  activity?: string; // For time-expired, what activity ended
  trophyName?: string; // For trophy notifications
  trophyIcon?: string; // For trophy notifications
  daysRemaining?: number; // For trophy progress
}

// Notification copy - encouraging, no guilt language
const NOTIFICATION_COPY = {
  "streak-warning": {
    title: "Your streak is still intact",
    body: "If today mattered, come log it.",
  },
  "time-expired": {
    title: "Time's up!",
    body: "Your scroll time ended. Come back to earn more!",
  },
  "time-expired-followup": {
    title: "Ready for more?",
    body: "Play a game or read some cards to unlock more scroll time.",
  },
  "trophy-progress": {
    title: "Trophy incoming! 🏆",
    body: "You're just {days} days away from your next trophy.",
  },
  "trophy-earned": {
    title: "Trophy Unlocked! 🎉",
    body: "You earned the {trophy} trophy! Keep going.",
  },
};

// Declare EdgeRuntime for TypeScript
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, userId, scheduledFor, activity, trophyName, trophyIcon, daysRemaining } = await req.json() as NotificationRequest;

    // Validate notification type
    const validTypes = ["streak-warning", "time-expired", "trophy-progress", "trophy-earned"];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Invalid notification type. Allowed: ${validTypes.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let title = "";
    let body = "";

    // Build notification content based on type
    switch (type) {
      case "streak-warning":
        title = NOTIFICATION_COPY["streak-warning"].title;
        body = NOTIFICATION_COPY["streak-warning"].body;
        break;
        
      case "time-expired":
        title = NOTIFICATION_COPY["time-expired"].title;
        body = activity 
          ? `Your ${activity} time ended. Come back to earn more!`
          : NOTIFICATION_COPY["time-expired"].body;
        break;
        
      case "trophy-progress":
        title = NOTIFICATION_COPY["trophy-progress"].title;
        body = NOTIFICATION_COPY["trophy-progress"].body.replace("{days}", String(daysRemaining || "?"));
        break;
        
      case "trophy-earned":
        title = trophyIcon 
          ? `${trophyIcon} ${NOTIFICATION_COPY["trophy-earned"].title}`
          : NOTIFICATION_COPY["trophy-earned"].title;
        body = NOTIFICATION_COPY["trophy-earned"].body.replace("{trophy}", trophyName || "new");
        break;
    }

    // For scheduled notifications, use background task
    if (scheduledFor) {
      const delay = new Date(scheduledFor).getTime() - Date.now();
      
      if (delay > 0) {
        // Schedule notification for later using background task
        const backgroundTask = async () => {
          // Wait until scheduled time
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Log notification (in production, integrate with push service like FCM/APNs)
          console.log(`[NOTIFICATION] Sending ${type} to user ${userId}`);
          console.log(`[NOTIFICATION] Title: ${title}`);
          console.log(`[NOTIFICATION] Body: ${body}`);
          
          // If time-expired, schedule a follow-up 5 minutes later
          if (type === "time-expired") {
            await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
            console.log(`[NOTIFICATION] Sending earn-prompt follow-up to user ${userId}`);
            console.log(`[NOTIFICATION] Title: ${NOTIFICATION_COPY["time-expired-followup"].title}`);
            console.log(`[NOTIFICATION] Body: ${NOTIFICATION_COPY["time-expired-followup"].body}`);
          }
        };

        // Use EdgeRuntime.waitUntil if available
        if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
          EdgeRuntime.waitUntil(backgroundTask());
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Notification scheduled for ${scheduledFor}`,
            type,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // For immediate notifications
    console.log(`[NOTIFICATION] Sending ${type} to user ${userId}`);
    console.log(`[NOTIFICATION] Title: ${title}`);
    console.log(`[NOTIFICATION] Body: ${body}`);

    // Return success - in production, integrate with push notification service
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent",
        type,
        title,
        body,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
