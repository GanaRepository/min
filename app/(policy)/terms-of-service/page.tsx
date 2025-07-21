export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen mt-8">
      <h1 className="text-4xl font-bold mb-8 text-black">Terms of Service</h1>

      <div className="prose prose-lg max-w-none text-gray-900 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using Pioneer IT Systems services, you agree to be
            bound by these Terms of Service and all applicable laws and
            regulations. If you do not agree with any of these terms, you are
            prohibited from using our services.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            2. Use License
          </h2>
          <p>
            Permission is granted to temporarily access our services for
            personal, non-commercial use only. This license shall automatically
            terminate if you violate any of these restrictions and may be
            terminated by Pioneer IT Systems at any time.
          </p>
          <p>Under this license, you may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modify or copy our materials</li>
            <li>Use materials for any commercial purpose</li>
            <li>Remove any copyright or proprietary notations</li>
            <li>Transfer the materials to another person</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            3. Service Availability
          </h2>
          <p>
            We strive to ensure our services are available 24/7, but we cannot
            guarantee uninterrupted access. We reserve the right to modify,
            suspend, or discontinue any aspect of our services at any time.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            4. Intellectual Property
          </h2>
          <p>
            All content, features, and functionality of our services are owned
            by Pioneer IT Systems and are protected by international copyright,
            trademark, and other intellectual property laws.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            5. Limitation of Liability
          </h2>
          <p>
            Pioneer IT Systems shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use
            of our services.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black mt-8">
            6. Contact Information
          </h2>
          <p>
            For any questions regarding these Terms of Service, please contact
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
