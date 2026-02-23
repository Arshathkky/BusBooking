import React from "react";

const AboutSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            About Touch Me+
          </h2>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            Eastern Province’s leading online bus and coach reservation platform,
            transforming the way passengers travel across Sri Lanka.
          </p>
        </div>

        {/* Two Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left Column */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Our Initiative Aims To:
            </h3>

            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                Digitize seat reservations for private buses operating in the Eastern Province
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                Improve passenger convenience and reduce waiting time
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                Increase transparency and operational efficiency
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                Support private bus operators with advanced fleet management technology
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                Strengthen coordination between regulatory authorities and private operators
              </li>
            </ul>
          </div>

          {/* Right Column */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Our Platform Offers:
            </h3>

            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Online bus ticket booking
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                24/7 hotline reservation service
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Real-time bus tracking
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Fleet management services
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Seat reservation up to one month in advance
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Instant notifications for schedule or bus changes
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Easy seat modification (subject to cancellation policy)
              </li>
            </ul>
          </div>

        </div>

        {/* Partnership Section */}
        {/* Partnership Section */}
        <div className="mt-14 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Strategic Banking Partnership
            </h3>

            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
                We are proud to collaborate with People’s Bank to provide secure,
                reliable, and modern payment solutions for passengers and operators.
            </p>

            <ul className="space-y-4 text-gray-600 max-w-md mx-auto">
                <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Secure online payment gateways
                </li>
                <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Card payment facilities
                </li>
                <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                POS (Point of Sale) systems for operators
                </li>
                <li className="flex items-start">
                <span className="text-cyan-600 font-bold mr-2">•</span>
                Convenient card-based payment options
                </li>
            </ul>

            <p className="mt-8 text-gray-600 max-w-4xl mx-auto">
                This collaboration between regulatory authorities, private bus operators,
                and People’s Bank ensures a secure, reliable, and modern transportation
                experience for passengers across Sri Lanka.
            </p>
            </div>
      </div>
    </section>
  );
};

export default AboutSection;