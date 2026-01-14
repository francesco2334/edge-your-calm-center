import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using DopaMINE, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="mb-3">
              DopaMINE is a behavioral awareness and self-regulation app designed to help users 
              build healthier attention patterns and impulse management skills. The app includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Mojo: An AI-powered behavioral support companion</li>
              <li>Regulation tools for building pause and awareness skills</li>
              <li>Progress tracking and streak systems</li>
              <li>Educational content about attention and impulse patterns</li>
            </ul>
          </section>

          <section className="bg-muted/30 rounded-xl p-5 border border-border/30">
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Important Disclaimer</h2>
            <p className="mb-3">
              <strong>DopaMINE is NOT a medical, therapeutic, or clinical service.</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Mojo and all app features are behavioral support tools, not therapy or treatment</li>
              <li>The app does not diagnose, treat, cure, or prevent any medical or mental health condition</li>
              <li>Content provided is for informational and educational purposes only</li>
              <li>If you are experiencing a mental health crisis, please contact a qualified healthcare professional or emergency services</li>
              <li>The app is not a substitute for professional medical advice, diagnosis, or treatment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. AI-Powered Features</h2>
            <p className="mb-3">
              Mojo uses artificial intelligence to provide guided reflection and behavioral awareness strategies. 
              By using Mojo, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>AI responses are generated based on patterns and may not always be accurate or appropriate for your situation</li>
              <li>Mojo does not have the capability to understand your complete personal context</li>
              <li>AI-generated content should not be relied upon as professional advice</li>
              <li>You use AI features at your own discretion and risk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. User Responsibilities</h2>
            <p className="mb-3">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide accurate account information</li>
              <li>Use the app in accordance with all applicable laws</li>
              <li>Not use the app for any unlawful or harmful purpose</li>
              <li>Not attempt to circumvent any security features</li>
              <li>Take responsibility for your own wellbeing and seek professional help when needed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of DopaMINE are owned by us and are protected 
              by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, DopaMINE and its creators shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages resulting from 
              your use of or inability to use the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes through the app or via email. Continued use of the app after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at legal@dopamine-app.com
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
