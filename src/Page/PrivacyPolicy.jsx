import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-black dark:text-black">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Welcome to our Hotel Booking App. Your privacy is important to us. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We may collect personal information that you provide when you register, book a hotel, or interact with our services, including:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Payment information</li>
        <li>Location data (optional, for nearby hotel recommendations)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <p className="mb-4">
        We use the collected information to:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Process bookings and payments</li>
        <li>Provide customer support</li>
        <li>Improve our services and personalize your experience</li>
        <li>Send important updates and promotional offers (you can opt out)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Cookies and Tracking</h2>
      <p className="mb-4">
        We use cookies and similar tracking technologies to improve user experience, analyze usage patterns, and enhance our services. You can control cookie preferences through your browser settings.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
      <p className="mb-4">
        We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Sharing Your Information</h2>
      <p className="mb-4">
        We do not sell your personal data. We may share information with trusted third parties (e.g., payment processors or hotel partners) to deliver our services, under strict data protection agreements.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal information. You may also request a copy of the data we hold about you.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Updates to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. We encourage you to review this page periodically for any changes.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about this Privacy Policy or our practices, please contact us at:
      </p>
      <p>Email: <a href="mailto:support@hotelbookingapp.com" className="text-blue-500 hover:underline">support@hotelbookingapp.com</a></p>
    </div>
  );
};

export default PrivacyPolicy;
