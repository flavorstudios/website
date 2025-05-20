const blogCategories = {
  "anime-reviews": {
    title: "Anime Reviews",
    description: "In-depth reviews of the latest and greatest anime series and movies.",
    heading: "Anime Reviews & Analysis",
    intro:
      "Dive into our collection of thoughtful anime reviews, covering everything from new seasonal releases to timeless classics. Our team breaks down storytelling, animation quality, character development, and cultural context.",
    featuredImage: "/images/categories/anime-reviews.jpg",
    color: "bg-purple-600",
    textColor: "text-white",
  },
  "gaming-news": {
    title: "Gaming News",
    description: "The latest updates, announcements, and breaking news from the gaming industry.",
    heading: "Gaming News & Updates",
    intro:
      "Stay informed with our curated gaming news coverage. We track industry trends, major releases, developer announcements, and the evolving gaming landscape across all platforms.",
    featuredImage: "/images/categories/gaming-news.jpg",
    color: "bg-blue-600",
    textColor: "text-white",
  },
  "tech-insights": {
    title: "Tech Insights",
    description: "Analysis and commentary on technology trends affecting gaming and entertainment.",
    heading: "Technology Insights & Analysis",
    intro:
      "Explore how technology shapes the future of entertainment. From rendering techniques to AI advancements, we examine the innovations driving games, animation, and interactive media forward.",
    featuredImage: "/images/categories/tech-insights.jpg",
    color: "bg-gray-800",
    textColor: "text-white",
  },
  "creator-spotlights": {
    title: "Creator Spotlights",
    description: "Interviews and profiles of game developers, animators, and digital artists.",
    heading: "Creator & Developer Spotlights",
    intro:
      "Meet the talented individuals behind your favorite games and animated content. Through interviews and studio tours, we highlight the creative processes, challenges, and inspirations of today's digital creators.",
    featuredImage: "/images/categories/creator-spotlights.jpg",
    color: "bg-yellow-500",
    textColor: "text-black",
  },
  "industry-analysis": {
    title: "Industry Analysis",
    description: "Deep dives into business trends, market shifts, and strategic moves in entertainment.",
    heading: "Entertainment Industry Analysis",
    intro:
      "Understand the business forces shaping gaming and animation. Our analysis covers market trends, business strategies, funding patterns, and the economic factors influencing creative decisions.",
    featuredImage: "/images/categories/industry-analysis.jpg",
    color: "bg-green-700",
    textColor: "text-white",
  },
}

export type BlogCategory = keyof typeof blogCategories
export type BlogCategoryData = (typeof blogCategories)[BlogCategory]

export default blogCategories
