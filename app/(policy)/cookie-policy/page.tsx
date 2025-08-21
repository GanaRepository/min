export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-8 sm:py-12 md:py-16 min-h-screen mt-4 sm:mt-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl  mb-8 text-black">
        Mintoons Cookie Policy
      </h1>

      <div className="prose prose-base sm:prose-lg max-w-none text-gray-900 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          This Cookie Policy explains how Mintoons (&quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;) uses cookies and similar
          technologies on our website (mintoons.com). By using our website, you
          consent to the use of cookies as described in this policy.
        </p>

        <div className="space-y-4">
          <h2 className="text-2xl  text-black mt-8">1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or
            mobile device when you visit mintoons.com. They are widely used to
            make websites work more efficiently and provide useful information
            to website owners, including us at Mintoons.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl  text-black mt-8">
            2. Types of Cookies We Use
          </h2>
          <p>We use the following types of cookies on mintoons.com:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Essential Cookies:</strong>{' '}
              Required for the website to function properly
            </li>
            <li>
              <strong className="text-black">Performance Cookies:</strong> Help
              us improve website performance and user experience
            </li>
            <li>
              <strong className="text-black">Functionality Cookies:</strong>{' '}
              Remember your preferences and settings
            </li>
            <li>
              <strong className="text-black">Analytics Cookies:</strong> Help us
              understand how visitors interact with our website and improve our
              creative writing platform
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl  text-black mt-8">3. How We Use Cookies</h2>
          <p>We use cookies for various purposes on mintoons.com, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide essential website functionality</li>
            <li>To remember your preferences</li>
            <li>To analyze and improve our website performance</li>
            <li>To personalize your experience on Mintoons</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl  text-black mt-8">4. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their
            settings. You can:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>View cookies stored on your computer</li>
            <li>Delete all or specific cookies</li>
            <li>Block or allow cookies by default</li>
            <li>Block third-party cookies</li>
          </ul>
          <p className="mt-4">
            Please note that blocking cookies may affect the functionality of
            our website, including creative writing and mentorship features.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl  text-black mt-8">5. Third-Party Cookies</h2>
          <p>We may use third-party services that use cookies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Analyze website traffic (Google Analytics)</li>
            <li>Provide social media features</li>
            <li>
              Display personalized content and recommendations for young writers
              and mentors
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl  text-black mt-8">
            6. Updates to This Policy
          </h2>
          <p>
            We may update this Cookie Policy from time to time. Please check
            this page regularly for any changes. Your continued use of
            mintoons.com after changes are posted constitutes your acceptance of
            the updated policy.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl  text-black mt-8">7. Contact Us</h2>
          <p>
            If you have questions about our Cookie Policy, please contact us:
          </p>
          <ul className="list-none space-y-2">
            <li>By email: support@mintoons.com</li>
            <li>By mail: Mintoons, Dallas, TX, USA</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
