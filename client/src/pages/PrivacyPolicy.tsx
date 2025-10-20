import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setLocation('/')}
          className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: October 2025
          </p>

          <div className="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                1. What Data We Collect
              </h2>
              <p>
                We collect only the data necessary to operate the Service safely:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Request logs:</strong> IP address, timestamps (for rate limiting & security).</li>
                <li><strong>Prompts / URLs submitted:</strong> temporarily processed to generate results.</li>
                <li><strong>Basic analytics:</strong> number of API calls, errors, usage stats (no personal tracking).</li>
              </ul>
              <p className="mt-3">
                We do not intentionally collect personal data unless you include it in your prompt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                2. How We Use Your Data
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide summaries and bias detection results.</li>
                <li>To prevent abuse, debug errors, and improve performance.</li>
                <li>To comply with legal requests or prevent misuse.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                3. How Long We Keep Data
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Temporary request data is deleted automatically within 30 days.</li>
                <li>Logs may be kept longer for security and aggregate analytics only.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                4. Cookies & Tracking
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We use minimal cookies only for session or rate-limiting purposes.</li>
                <li>No marketing or third-party tracking cookies are used.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                5. Data Security
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We follow industry-standard encryption and access controls.</li>
                <li>However, no system is perfectly secure — use at your own risk.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                6. Your Rights
              </h2>
              <p>
                If you are in the EU, UK, or California, you may request access, correction, or deletion 
                of your personal data by emailing{' '}
                <a href="mailto:privacy@articlesynthesis.ai" className="text-blue-600 dark:text-blue-400 hover:underline">
                  privacy@articlesynthesis.ai
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                7. Children's Privacy
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Our service is not directed to users under 13 years old.</li>
                <li>If we learn that data from a child under 13 was submitted, we will delete it.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                8. Third-Party Links
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Outputs may include citations or links to external websites.</li>
                <li>We are not responsible for their content or privacy practices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy at any time. The "Last updated" date shows the latest version.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
