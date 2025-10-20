import { useState } from 'react';
import { X, FileText, Shield } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function PolicyModal({ isOpen, onAccept, onClose }: PolicyModalProps) {
  const [showingPolicy, setShowingPolicy] = useState<'none' | 'terms' | 'privacy'>('none');

  if (!isOpen) return null;

  const handleAccept = () => {
    setShowingPolicy('none');
    onAccept();
  };

  const handleSkip = () => {
    setShowingPolicy('none');
    onClose();
  };

  if (showingPolicy === 'terms') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Terms of Service</h2>
            </div>
            <button
              onClick={() => setShowingPolicy('none')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Overview</h3>
                <p>
                  Welcome to Article Synthesis AI ("we," "us," or "the Service").
                  By using our website or API, you agree to these Terms of Service.
                  If you do not agree, do not use the Service.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2. What We Do</h3>
                <p>Article Synthesis AI is an educational and research tool that helps users:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>combine information from multiple online sources,</li>
                  <li>analyze tone or bias, and</li>
                  <li>generate AI-assisted summaries and articles.</li>
                </ul>
                <p className="mt-2">
                  All outputs are AI-generated or AI-assisted and should be verified before publication.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3. User Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You must have the right to use any URLs or content you submit.</li>
                  <li>Do not upload or request unlawful, hateful, defamatory, or infringing content.</li>
                  <li>You agree not to use the Service to harass others or spread misinformation.</li>
                  <li>You are responsible for checking accuracy and legality before publishing any output.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">4. Copyright & Fair Use</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We only summarize and cite publicly available sources.</li>
                  <li>We do not store or redistribute full-text articles.</li>
                  <li>Our summaries fall under fair use for commentary, criticism, education, and research.</li>
                  <li>If you believe your copyrighted material is misused, see our DMCA Policy.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  5. No Guarantee of Accuracy or Unbiased Output
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Our AI attempts to reduce bias, but cannot remove it completely.</li>
                  <li>Outputs may contain factual errors, outdated information, or unintentional bias.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">6. Limitation of Liability</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>The Service is provided "as is."</li>
                  <li>We are not liable for damages resulting from use of our outputs or website.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">7. Rate Limits and Access</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Automated scraping or bypassing API rate limits is prohibited.</li>
                  <li>We may suspend access for abuse or security reasons.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">8. Changes to These Terms</h3>
                <p>
                  We may update these Terms at any time. The "Last updated" date reflects the latest version.
                  Continued use means you accept the updated Terms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">9. Contact</h3>
                <p>
                  For legal questions or takedown notices:
                  <br />
                  📧 <a href="mailto:legal@articlesynthesis.ai" className="text-blue-600 dark:text-blue-400 hover:underline">
                    legal@articlesynthesis.ai
                  </a>
                </p>
              </section>
            </div>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowingPolicy('none')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showingPolicy === 'privacy') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Privacy Policy</h2>
            </div>
            <button
              onClick={() => setShowingPolicy('none')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">1. What Data We Collect</h3>
                <p>We collect only the data necessary to operate the Service safely:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Request logs:</strong> IP address, timestamps (for rate limiting & security).</li>
                  <li><strong>Prompts / URLs submitted:</strong> temporarily processed to generate results.</li>
                  <li><strong>Basic analytics:</strong> number of API calls, errors, usage stats (no personal tracking).</li>
                </ul>
                <p className="mt-2">
                  We do not intentionally collect personal data unless you include it in your prompt.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2. How We Use Your Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>To provide summaries and bias detection results.</li>
                  <li>To prevent abuse, debug errors, and improve performance.</li>
                  <li>To comply with legal requests or prevent misuse.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3. How Long We Keep Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Temporary request data is deleted automatically within 30 days.</li>
                  <li>Logs may be kept longer for security and aggregate analytics only.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">4. Cookies & Tracking</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We use minimal cookies only for session or rate-limiting purposes.</li>
                  <li>No marketing or third-party tracking cookies are used.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">5. Data Security</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We follow industry-standard encryption and access controls.</li>
                  <li>However, no system is perfectly secure — use at your own risk.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">6. Your Rights</h3>
                <p>
                  If you are in the EU, UK, or California, you may request access, correction, or deletion
                  of your personal data by emailing{' '}
                  <a href="mailto:privacy@articlesynthesis.ai" className="text-blue-600 dark:text-blue-400 hover:underline">
                    privacy@articlesynthesis.ai
                  </a>.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">7. Children's Privacy</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Our service is not directed to users under 13 years old.</li>
                  <li>If we learn that data from a child under 13 was submitted, we will delete it.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">8. Third-Party Links</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Outputs may include citations or links to external websites.</li>
                  <li>We are not responsible for their content or privacy practices.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">9. Changes to This Policy</h3>
                <p>
                  We may update this Privacy Policy at any time. The "Last updated" date shows the latest version.
                </p>
              </section>
            </div>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowingPolicy('none')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to Article Synthesis AI</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            Before you continue, please review our Terms of Service and Privacy Policy.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setShowingPolicy('terms')}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Terms of Service</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Read →
              </span>
            </button>

            <button
              onClick={() => setShowingPolicy('privacy')}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Privacy Policy</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Read →
              </span>
            </button>
          </div>

          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleAccept}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
              data-testid="button-accept-policies"
            >
              I Accept — Continue to Sign Up
            </button>
            <button
              onClick={handleSkip}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              data-testid="button-skip-policies"
            >
              Skip for Now — I'll Read Later
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
