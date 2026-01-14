import { motion } from 'framer-motion';
import { ArrowLeft, Database, MessageSquare, Activity, Shield, Lock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-6 py-8 pb-24">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

        {/* Data Inventory Summary Cards */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data We Collect
          </h2>
          
          <div className="grid gap-4">
            {/* Usage Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl bg-muted/30 border border-border/30"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">Usage Statistics</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tracks your app activity to show progress and insights.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data collected:</span>
                      <span className="text-foreground">Token balance, streak count, game completions, learn card progress</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="text-foreground">Device (local) + Cloud (if signed in)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shared with:</span>
                      <span className="text-green-500">No one</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Linked to identity:</span>
                      <span className="text-foreground">Only if signed in</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Chat Messages */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl bg-muted/30 border border-border/30"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">AI Chat Messages (Mojo)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Conversations with Mojo to provide behavioral support.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data collected:</span>
                      <span className="text-foreground">Chat messages you send to Mojo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="text-foreground">Session only (not permanently stored)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shared with:</span>
                      <span className="text-foreground">AI provider (Lovable AI) for response generation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used for training:</span>
                      <span className="text-green-500">No</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Productivity Logs */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-muted/30 border border-border/30"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">Productivity Logs</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Self-reported productive activities you choose to log.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data collected:</span>
                      <span className="text-foreground">Category selected, optional description (max 200 chars)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="text-foreground">Device (local) + Cloud (if signed in)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shared with:</span>
                      <span className="text-green-500">No one</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purpose:</span>
                      <span className="text-foreground">Token rewards, personal tracking only</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Security Measures */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            How We Protect Your Data
          </h2>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <ul className="space-y-3 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>All data transmitted over encrypted HTTPS connections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Cloud data encrypted at rest using industry-standard encryption</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>No API keys or secrets stored on your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>AI conversations processed in real-time, not stored permanently</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Your data is never sold to third parties</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Full Policy */}
        <div className="space-y-8 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Full Privacy Policy
            </h2>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">1. Information We Collect</h3>
            <p className="mb-3">DopaMINE collects the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Account Information:</strong> Email address and optional username when you create an account.</li>
              <li><strong>Usage Data:</strong> Token balance, points, streak count, game completions, learn card progress, and productivity logs.</li>
              <li><strong>Chat Data:</strong> Conversations with Mojo are processed by AI to provide responses but are not permanently stored on our servers.</li>
              <li><strong>Device Information:</strong> Push notification tokens (if enabled) for sending reminders.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">2. How We Use Your Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To provide and personalize the DopaMINE experience</li>
              <li>To track your progress, tokens, and streaks within the app</li>
              <li>To send you only two types of notifications: streak warnings and time-expired alerts</li>
              <li>To improve our behavioral support tools and features</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">3. AI-Powered Features (Mojo)</h3>
            <p className="mb-3">
              Mojo uses AI to provide behavioral support and regulation guidance:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Chat conversations are sent to our AI provider (Lovable AI) to generate responses</li>
              <li>Messages are processed in real-time and not stored after the session</li>
              <li>We do not use your conversations to train AI models</li>
              <li>You must consent before your first message is sent to AI</li>
              <li>Mojo is a behavioral support tool, not a medical or therapeutic service</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">4. Notifications</h3>
            <p className="mb-3">
              DopaMINE only sends two types of notifications:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Streak Warning:</strong> Sent when your streak is about to expire (less than 12 hours remaining)</li>
              <li><strong>Time Expired:</strong> Sent when your purchased screen time session ends</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We never send marketing notifications, engagement pings, or random reminders.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">5. Data Sharing</h3>
            <p>
              We do not sell your personal information. Data is shared only with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li><strong>Lovable AI:</strong> Processes Mojo chat messages to generate responses</li>
              <li><strong>Cloud Infrastructure:</strong> Securely stores your account data if you sign in</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">6. Your Rights</h3>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Disable notifications at any time in Settings</li>
              <li>Use the app without signing in (data stored locally only)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">7. Children's Privacy</h3>
            <p>
              DopaMINE is not intended for children under 13. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">8. Contact Us</h3>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us at{' '}
              <a href="mailto:privacy@dopamine-app.com" className="text-primary hover:underline">
                privacy@dopamine-app.com
              </a>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
