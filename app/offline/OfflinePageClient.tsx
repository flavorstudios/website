'use client';

// This component handles the JSON-LD schema script.
function JsonLdSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://flavorstudios.in/offline',
    url: 'https://flavorstudios.in/offline',
    name: 'Offline – Flavor Studios',
    description:
      'You are offline. Please check your internet connection to access the latest anime news, original stories, and games from Flavor Studios.',
  };
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// This is the main client component holding the UI.
export default function OfflinePageClient() {
  return (
    <>
      <JsonLdSchema />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-8"> {/* Added py-8 for vertical padding on smaller screens */}
        <div className="max-w-4xl mx-auto text-center w-full"> {/* Added w-full to ensure it takes full width within max-w */}
          {/* Offline Animation Heading */}
          <div className="mb-6 sm:mb-8">
            <div className="relative">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse">
                Offline
              </h1>
              <div className="absolute inset-0 text-5xl sm:text-7xl md:text-8xl font-bold text-blue-100 -z-10 transform translate-x-1 translate-y-1 sm:translate-x-2 sm:translate-y-2">
                Offline
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              You&apos;re Currently Offline
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              It looks like you&apos;ve lost your internet connection. Don&apos;t worry—once
              you&apos;re back online, you&apos;ll be able to access all of our amazing
              content again!
            </p>
            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all duration-200"
                aria-label="Try Again"
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
                Try Again
              </button>
              <button
                onClick={() => history.back()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg shadow-lg transition-all duration-200"
                aria-label="Go Back"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Go Back
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connection Tips
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() =>
                  navigator.onLine
                    ? alert('You are online!')
                    : alert('Still offline')
                }
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-200 hover:bg-green-50 rounded-lg transition-all duration-200"
                aria-label="Check Connection"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Check Connection
              </button>
            </div>
          </div>
          {/* Footer Message */}
          <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
            <p>
              Connection Status: Offline • Please Check Your Internet • Flavor
              Studios
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
