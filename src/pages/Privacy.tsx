import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-6 py-8">
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: December 2024</p>

        <div className="space-y-8 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p className="mb-3">DopaMINE collects the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Account Information:</strong> Email address and optional username when you create an account.</li>
              <li><strong>Usage Data:</strong> Interaction patterns with app features, including tool usage, session durations, and feature engagement.</li>
              <li><strong>Chat Data:</strong> Conversations with Mojo, our AI-powered behavioral support companion, are processed to provide responses but are not permanently stored on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To provide and personalize the DopaMINE experience</li>
              <li>To track your progress and streaks within the app</li>
              <li>To improve our behavioral support tools and features</li>
              <li>To communicate important updates about the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Storage</h2>
            <p>
              Your data is stored securely using industry-standard encryption. We use cloud infrastructure 
              with robust security measures to protect your information. Account data is stored in secure 
              databases with access controls and encryption at rest.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. AI-Powered Features</h2>
            <p className="mb-3">
              Mojo, our AI companion, uses advanced language models to provide behavioral support and 
              regulation guidance. Important notes about AI interactions:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Chat conversations are processed in real-time to generate responses</li>
              <li>AI responses are generated based on your input and our system guidelines</li>
              <li>Mojo is a behavioral support tool, not a medical or therapeutic service</li>
              <li>We do not use your conversations to train AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with service providers who 
              assist in operating our app, subject to confidentiality agreements. We may disclose 
              information if required by law or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us at 
              privacy@dopamine-app.com
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
