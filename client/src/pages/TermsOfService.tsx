import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: October 2025
          </p>

          <div className="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                1. Overview
              </h2>
              <p>
                Welcome to Article Synthesis AI ("we," "us," or "the Service").
                By using our website or API, you agree to these Terms of Service.
                If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                2. What We Do
              </h2>
              <p>
                Article Synthesis AI is an educational and research tool that helps users:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>combine information from multiple online sources,</li>
                <li>analyze tone or bias, and</li>
                <li>generate AI-assisted summaries and articles.</li>
              </ul>
              <p className="mt-3">
                All outputs are AI-generated or AI-assisted and should be verified before publication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                3. User Responsibilities
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must have the right to use any URLs or content you submit.</li>
                <li>Do not upload or request unlawful, hateful, defamatory, or infringing content.</li>
                <li>You agree not to use the Service to harass others or spread misinformation.</li>
                <li>You are responsible for checking accuracy and legality before publishing any output.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                4. Copyright & Fair Use
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We only summarize and cite publicly available sources.</li>
                <li>We do not store or redistribute full-text articles.</li>
                <li>Our summaries fall under fair use for commentary, criticism, education, and research.</li>
                <li>If you believe your copyrighted material is misused, see our DMCA Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                5. No Guarantee of Accuracy or Unbiased Output
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Our AI attempts to reduce bias, but cannot remove it completely.</li>
                <li>Outputs may contain factual errors, outdated information, or unintentional bias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                6. Limitation of Liability
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The Service is provided "as is."</li>
                <li>We are not liable for damages resulting from use of our outputs or website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                7. Rate Limits and Access
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Automated scraping or bypassing API rate limits is prohibited.</li>
                <li>We may suspend access for abuse or security reasons.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                8. Changes to These Terms
              </h2>
              <p>
                We may update these Terms at any time. The "Last updated" date reflects the latest version. 
                Continued use means you accept the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                9. Contact
              </h2>
              <p>
                For legal questions or takedown notices:<br />
                📧 <a href="mailto:legal@articlesynthesis.ai" className="text-blue-600 dark:text-blue-400 hover:underline">
                  legal@articlesynthesis.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
