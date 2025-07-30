export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-8 sm:py-12 md:py-16 min-h-screen mt-4 sm:mt-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-black">Mintoons Privacy Policy</h1>

      <div className="prose prose-base sm:prose-lg max-w-none text-gray-900 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          This Privacy Policy explains how Mintoons ("we", "us", or "our") collects, uses, and protects your information when you use our website (mintoons.com) and related services. By using Mintoons, you agree to the terms of this policy.
        </p>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            1. Information We Collect
          </h2>
          <p>
            At Mintoons, we collect different types of information for various purposes to provide and improve our creative writing platform and services to you:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Personal identification information (Name, email address, age, school, parent/guardian contact if under 13)
            </li>
            <li>
              Technical data (IP address, browser type, device information)
            </li>
            <li>Usage data (How you interact with our platform and stories)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            2. How We Use Your Information
          </h2>
          <p>We use the collected data for various purposes, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our creative writing platform</li>
            <li>To notify you about changes to our services</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve Mintoons</li>
            <li>To ensure a safe and positive experience for children, mentors, and families</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            3. Data Security
          </h2>
          <p>
            The security of your data is important to us. We implement
            appropriate security measures to protect against unauthorized
            access, alteration, disclosure, or destruction of your personal
            information. We are committed to protecting the privacy of children and families using Mintoons.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            4. Third-Party Services
          </h2>
          <p>
            We may employ third-party companies and individuals to facilitate
            our services, provide services on our behalf, perform
            service-related services, or assist us in analyzing how our platform is used. These third parties have access to your information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
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
