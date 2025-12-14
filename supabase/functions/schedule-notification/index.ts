import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * NOTIFICATION SCHEDULER
 * 
 * Only TWO notification types are allowed:
 * 1. STREAK WARNING: User hasn't logged today, streak expires in <12 hours
 * 2. TIME EXPIRED: Purchased time session has ended
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
  type: "streak-warning" | "time-expired";
  userId: string;
  scheduledFor?: string; // ISO timestamp for when to send
  activity?: string; // For time-expired, what activity ended
}

// Notification copy - no guilt language, no urgency panic
const NOTIFICATION_COPY = {
  "streak-warning": {
    title: "Your streak is still intact",
    body: "If today mattered, come log it.",
  },
  "time-expired": {
    title: "Your chosen time has ended",
    body: "Come back when you're ready.",
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

    const { type, userId, scheduledFor, activity } = await req.json() as NotificationRequest;

    // Validate notification type
    if (!["streak-warning", "time-expired"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid notification type. Only streak-warning and time-expired are allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const copy = NOTIFICATION_COPY[type];
    
    // Customize body for time-expired
    const notificationBody = type === "time-expired" && activity
      ? `Your ${activity} time has ended. Come back when you're ready.`
      : copy.body;

    // For time-expired with scheduled time, use background task
    if (type === "time-expired" && scheduledFor) {
      const delay = new Date(scheduledFor).getTime() - Date.now();
      
      if (delay > 0) {
        // Schedule notification for later using background task
        const backgroundTask = async () => {
          // Wait until scheduled time
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Log notification (in production, integrate with push service)
          console.log(`[NOTIFICATION] Sending time-expired to user ${userId}`);
          console.log(`[NOTIFICATION] Title: ${copy.title}`);
          console.log(`[NOTIFICATION] Body: ${notificationBody}`);
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

    // For streak-warning or immediate notifications
    console.log(`[NOTIFICATION] Sending ${type} to user ${userId}`);
    console.log(`[NOTIFICATION] Title: ${copy.title}`);
    console.log(`[NOTIFICATION] Body: ${notificationBody}`);

    // Return success - in production, integrate with push notification service
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent",
        type,
        title: copy.title,
        body: notificationBody,
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
