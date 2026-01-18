import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="bg-white rounded-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Shataya (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). This Privacy Policy applies to the Shataya website
              (www.shatayaglobal.com) and mobile application (collectively, the &quot;Services&quot;). We are committed
              to protecting your personal information and your right to privacy. This policy describes how we
              collect, use, store, and share your information when you use our workforce management platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-2">When you create an account, we collect:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Physical address</li>
              <li>Profile photos</li>
              <li>Employment history and qualifications</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">2.2 Location Information</h3>
            <p className="text-gray-700 leading-relaxed">
              With your permission, we collect precise location data to help match you with nearby job opportunities
              and provide location-based services. You can disable location services at any time through your device settings.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">2.3 Communication Data</h3>
            <p className="text-gray-700 leading-relaxed">
              We collect messages and communications sent through our platform between workers and employers,
              including job applications, inquiries, and chat messages.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">2.4 Files and Documents</h3>
            <p className="text-gray-700 leading-relaxed">
              We store documents you upload, such as resumes, certifications, and other professional documents.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">2.5 Usage Information</h3>
            <p className="text-gray-700 leading-relaxed">
              We automatically collect information about how you use our Services, including job searches,
              applications submitted, and features accessed.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-2">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Provide and maintain our Services</li>
              <li>Match workers with job opportunities</li>
              <li>Facilitate communication between workers and employers</li>
              <li>Personalize your experience and show relevant job recommendations</li>
              <li>Process job applications and manage accounts</li>
              <li>Send important notifications about your account or jobs</li>
              <li>Improve our Services and develop new features</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">4.1 With Other Users</h3>
            <p className="text-gray-700 leading-relaxed">
              Your profile information may be visible to potential employers when you apply for jobs.
              Employers can see your name, qualifications, and contact information.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">4.2 With Third-Party Services</h3>
            <p className="text-gray-700 mb-2">We share limited data with:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li><strong>Google Maps API:</strong> Location and address data for mapping and geocoding services</li>
              <li><strong>Google OAuth:</strong> Authentication data when you sign in with Google</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">4.3 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law or in response to valid legal requests.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate security measures to protect your data. All data transmitted between
              your device and our servers is encrypted using industry-standard SSL/TLS protocols. However,
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to
              provide our Services. When you delete your account, we will delete your personal information
              within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of promotional communications</li>
              <li>Disable location services</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:shatayabuilding@gmail.com" className="text-blue-600 hover:underline">
                shatayabuilding@gmail.com
              </a>
            </p>
          </section>

          {/* Account Deletion */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Account Deletion</h2>
            <p className="text-gray-700 leading-relaxed">
              To request deletion of your account and associated data, please contact us at{" "}
              <a href="mailto:shatayabuilding@gmail.com" className="text-blue-600 hover:underline">
                shatayabuilding@gmail.com
              </a>{" "}
              with your account email address. We will process your request within 30 days and permanently
              delete all personal data including your profile, messages, and application history.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Services are not intended for users under the age of 18. We do not knowingly collect
              personal information from children under 18. If you believe we have collected information
              from a child under 18, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Users</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are accessing our Services from outside Israel, please note that your information may
              be transferred to, stored, and processed in Israel where our servers are located. By using our
              Services, you consent to this transfer.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We
              encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> shatayabuilding@gmail.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +972 54-612-6874</p>
              <p className="text-gray-700"><strong>Address:</strong> Hapalekh Street 7, Tel Aviv, Israel</p>
              <p className="text-gray-700">
                <strong>Website:</strong>{" "}
                <a href="https://www.shatayaglobal.com" className="text-blue-600 hover:underline">
                  www.shatayaglobal.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
