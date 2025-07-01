'use client';

// === JSON-LD WebPage Schema ===
function JsonLdSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://flavorstudios.in/maintenance',
    url: 'https://flavorstudios.in/maintenance',
    name: 'Under Maintenance – Flavor Studios',
    description:
      "Our website is currently under scheduled maintenance. We'll be back soon with new features and improvements. Stay tuned with Flavor Studios!",
  };
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// === Reusable Feature Card component ===
function FeatureCard({
  icon,
  gradient,
  title,
  description,
}: {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group">
      <div className="h-full bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {icon}
          </svg>
        </div>
        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}


// === The Main Client Component ===
export default function MaintenancePageClient() {
  return (
    <>
      <JsonLdSchema />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <div className="mb-6 sm:mb-8">
            <div className="relative">
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-pulse">
                UPGRADING
              </h1>
              <div className="absolute inset-0 text-6xl sm:text-8xl md:text-9xl font-bold text-blue-100 -z-10 transform translate-x-1 translate-y-1 sm:translate-x-2 sm:translate-y-2">
                UPGRADING
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We're Making Things Better
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Our website is currently undergoing scheduled maintenance to improve
              your experience. We'll be back online shortly with exciting new
              features and improvements!
            </p>

            {/* Estimated Time */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-yellow-800 font-medium">
                  Estimated completion: 2-4 hours
                </span>
              </div>
            </div>

            {/* Check Again Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg transition-all duration-200"
                aria-label="Reload page"
              >
                <svg
                  className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Check Again
              </button>
            </div>
          </div>

          {/* Features Coming */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              What's coming after maintenance:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <FeatureCard
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                }
                gradient="from-blue-500 to-cyan-500"
                title="Faster Loading"
                description="Improved performance and speed"
              />
              <FeatureCard
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                }
                gradient="from-purple-500 to-pink-500"
                title="New Features"
                description="Enhanced functionality and tools"
              />
              <FeatureCard
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                }
                gradient="from-green-500 to-emerald-500"
                title="Enhanced Security"
                description="Improved protection and privacy"
              />
              <FeatureCard
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
                  />
                }
                gradient="from-orange-500 to-red-500"
                title="Mobile Optimized"
                description="Better mobile experience"
              />
              <FeatureCard
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                }
                gradient="from-indigo-500 to-purple-500"
                title="Bug Fixes"
                description="Resolved issues and improvements"
              />
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
            <p>
              Status: Under Maintenance • Expected Completion: 2-4 Hours • Flavor Studios
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
