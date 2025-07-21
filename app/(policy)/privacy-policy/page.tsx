export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen mt-8">
      <h1 className="text-4xl font-bold mb-8 text-black">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none text-gray-900 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            1. Information We Collect
          </h2>
          <p>
            At Pioneer IT Systems, we collect different types of information for
            various purposes to provide and improve our services to you:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Personal identification information (Name, email address, phone
              number)
            </li>
            <li>
              Technical data (IP address, browser type, device information)
            </li>
            <li>Usage data (How you interact with our services)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            2. How We Use Your Information
          </h2>
          <p>We use the collected data for various purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our services</li>
            <li>To notify you about changes to our services</li>
            <li>To provide customer support</li>
            <li>
              To gather analysis or valuable information to improve our services
            </li>
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
            information.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            4. Third-Party Services
          </h2>
          <p>
            We may employ third-party companies and individuals to facilitate
            our services, provide services on our behalf, perform
            service-related services, or assist us in analyzing how our services
            are used.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul className="list-none space-y-2">
            <li>By email: Hr@pioneeritsystems.com</li>
            <li>
              By mail: 9401 40th Avenue West, Suite 115, Lynnwood, WA 98036
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
