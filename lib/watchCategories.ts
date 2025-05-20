const watchCategories = {
  devlogs: {
    title: "Developer Logs",
    description: "Behind-the-scenes videos showing the game development process.",
    heading: "Developer Logs & Process Videos",
    intro:
      "Go behind the scenes with our developer logs. These videos document the creative and technical journey of game creation, from early prototypes to final polish, with commentary from the creators themselves.",
    featuredImage: "/images/categories/devlogs.jpg",
    color: "bg-blue-700",
    textColor: "text-white",
  },
  tutorials: {
    title: "Tutorials",
    description: "Step-by-step guides for game development, animation, and digital art.",
    heading: "Tutorials & Learning Resources",
    intro:
      "Level up your skills with our comprehensive tutorials. Whether you're interested in game development, animation techniques, or digital art creation, our instructional videos provide clear, actionable guidance.",
    featuredImage: "/images/categories/tutorials.jpg",
    color: "bg-green-600",
    textColor: "text-white",
  },
  reviews: {
    title: "Video Reviews",
    description: "In-depth video reviews of games, animation software, and creative tools.",
    heading: "Video Reviews & Critiques",
    intro:
      "Watch our detailed reviews of games, animation software, and creative tools. We test everything thoroughly to help you make informed decisions about what's worth your time and money.",
    featuredImage: "/images/categories/reviews.jpg",
    color: "bg-red-600",
    textColor: "text-white",
  },
  interviews: {
    title: "Creator Interviews",
    description: "Video conversations with game developers, animators, and industry figures.",
    heading: "Creator Interviews & Conversations",
    intro:
      "Hear directly from the creative minds shaping digital entertainment. Our interview series features conversations with game developers, animators, studio heads, and other industry professionals.",
    featuredImage: "/images/categories/interviews.jpg",
    color: "bg-purple-700",
    textColor: "text-white",
  },
  events: {
    title: "Event Coverage",
    description: "Videos from gaming conventions, animation festivals, and industry events.",
    heading: "Event Coverage & Highlights",
    intro:
      "Experience the excitement of major industry events through our video coverage. From E3 and GDC to animation festivals and indie showcases, we bring you the highlights and announcements that matter.",
    featuredImage: "/images/categories/events.jpg",
    color: "bg-yellow-600",
    textColor: "text-black",
  },
}

export type WatchCategory = keyof typeof watchCategories
export type WatchCategoryData = (typeof watchCategories)[WatchCategory]

export default watchCategories
