import type { BlogPost, Video, Comment } from "./admin-store"

export const sampleBlogs: BlogPost[] = [
  {
    id: "blog_1",
    title: "The Art of Anime Storytelling: Crafting Emotional Narratives",
    slug: "art-of-anime-storytelling",
    content: `Anime storytelling is a unique art form that combines visual aesthetics with deep emotional narratives. In this comprehensive guide, we explore the techniques that make anime stories so compelling and memorable.

## The Power of Visual Storytelling

Anime leverages the power of visual storytelling in ways that live-action cannot. Through exaggerated expressions, symbolic imagery, and dynamic camera movements, anime creators can convey emotions and concepts that resonate deeply with audiences.

### Key Elements of Great Anime Storytelling:

1. **Character Development**: Well-rounded characters with clear motivations
2. **Pacing**: Balancing action with quiet character moments
3. **Visual Metaphors**: Using imagery to convey deeper meanings
4. **Cultural Context**: Incorporating Japanese cultural elements authentically

## Creating Memorable Characters

The best anime characters are those that feel real despite being animated. They have flaws, dreams, and growth arcs that audiences can relate to. At Flavor Studios, we spend considerable time developing our characters' backstories and motivations.

## Conclusion

Great anime storytelling is about more than just entertainment—it's about creating experiences that stay with viewers long after the credits roll.`,
    excerpt:
      "Discover the secrets behind compelling anime narratives and learn how visual storytelling creates emotional connections with audiences.",
    status: "published",
    category: "Storytelling",
    tags: ["anime", "storytelling", "character development", "visual narrative"],
    featuredImage: "/placeholder.svg?height=400&width=600&text=Anime+Storytelling",
    seoTitle: "The Art of Anime Storytelling - Flavor Studios",
    seoDescription:
      "Learn the techniques behind compelling anime narratives and discover how to craft emotional stories that resonate with audiences.",
    author: "Admin",
    publishedAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    views: 1247,
  },
  {
    id: "blog_2",
    title: "Behind the Scenes: Our Animation Production Process",
    slug: "animation-production-process",
    content: `Ever wondered how we bring our anime characters to life? Take a behind-the-scenes look at our animation production process at Flavor Studios.

## Pre-Production Phase

Before any animation begins, we spend weeks in pre-production planning every detail of our episodes.

### Storyboarding
Our storyboard artists create detailed visual plans for each scene, mapping out camera angles, character positions, and timing.

### Character Design
We refine our character designs to ensure they're both visually appealing and animation-friendly.

## Production Pipeline

Our production pipeline is designed for efficiency while maintaining the highest quality standards.

### Key Animation
Our key animators create the most important frames that define character movements and expressions.

### In-Between Animation
In-between artists fill in the frames between key poses to create smooth motion.

### Digital Coloring
Our digital artists add colors and shading to bring the characters to life.

## Post-Production Magic

The final phase involves compositing, effects, and sound design to create the finished product.`,
    excerpt: "Get an exclusive look at how we create our anime episodes, from initial concept to final production.",
    status: "published",
    category: "Production",
    tags: ["animation", "production", "behind the scenes", "workflow"],
    featuredImage: "/placeholder.svg?height=400&width=600&text=Animation+Process",
    seoTitle: "Animation Production Process - Behind the Scenes at Flavor Studios",
    seoDescription:
      "Discover the detailed process behind creating anime episodes at Flavor Studios, from storyboarding to final production.",
    author: "Admin",
    publishedAt: "2024-01-10T14:30:00Z",
    createdAt: "2024-01-10T13:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
    views: 892,
  },
  {
    id: "blog_3",
    title: "The Future of Independent Anime Studios",
    slug: "future-independent-anime-studios",
    content: `The anime industry is evolving rapidly, and independent studios like Flavor Studios are at the forefront of this transformation.

## Creative Freedom

Independent studios have the unique advantage of creative freedom. Without the constraints of large corporate structures, we can take risks and explore innovative storytelling techniques.

## Technology and Innovation

New technologies are making high-quality animation more accessible to independent creators:

- **AI-assisted animation tools**
- **Cloud-based collaboration platforms**
- **Advanced rendering software**
- **Motion capture technology**

## Direct Audience Connection

Independent studios can build direct relationships with their audiences through social media, streaming platforms, and community engagement.

## Challenges and Opportunities

While independent studios face funding and distribution challenges, the rise of streaming platforms and digital distribution has created new opportunities for reaching global audiences.

## Our Vision

At Flavor Studios, we believe the future belongs to creators who can combine artistic vision with technological innovation and community engagement.`,
    excerpt:
      "Explore how independent anime studios are shaping the future of the industry through innovation and creative freedom.",
    status: "draft",
    category: "Industry",
    tags: ["independent studios", "future", "technology", "innovation"],
    featuredImage: "/placeholder.svg?height=400&width=600&text=Future+of+Anime",
    seoTitle: "The Future of Independent Anime Studios - Industry Insights",
    seoDescription:
      "Discover how independent anime studios are revolutionizing the industry with creative freedom and technological innovation.",
    author: "Admin",
    publishedAt: "2024-01-20T16:00:00Z",
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-19T15:30:00Z",
    views: 0,
  },
]

export const sampleVideos: Video[] = [
  {
    id: "video_1",
    title: "Flavor Studios Showreel 2024",
    description:
      "A compilation of our best work from 2024, showcasing the evolution of our animation style and storytelling capabilities. This showreel features clips from our latest episodes, character animations, and behind-the-scenes footage.",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/placeholder.svg?height=360&width=640&text=Showreel+2024",
    duration: "3:45",
    category: "Showreel",
    tags: ["showreel", "2024", "compilation", "best work"],
    status: "published",
    publishedAt: "2024-01-01T12:00:00Z",
    createdAt: "2023-12-28T10:00:00Z",
    updatedAt: "2024-01-01T12:00:00Z",
    views: 15420,
  },
  {
    id: "video_2",
    title: "Character Animation Breakdown - Akira's Fighting Scene",
    description:
      "Detailed breakdown of how we animated Akira's epic fighting scene from Episode 12. Learn about our animation techniques, timing, and the creative decisions that went into making this memorable sequence.",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/placeholder.svg?height=360&width=640&text=Akira+Fight+Scene",
    duration: "8:22",
    category: "Tutorial",
    tags: ["animation", "breakdown", "fighting", "tutorial"],
    status: "published",
    publishedAt: "2024-01-05T15:30:00Z",
    createdAt: "2024-01-03T09:00:00Z",
    updatedAt: "2024-01-05T15:30:00Z",
    views: 8934,
  },
  {
    id: "video_3",
    title: "Studio Tour - Welcome to Flavor Studios",
    description:
      "Take a virtual tour of our animation studio and meet the talented team behind your favorite anime series. See our workstations, equipment, and get insights into our daily creative process.",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/placeholder.svg?height=360&width=640&text=Studio+Tour",
    duration: "12:15",
    category: "Behind the Scenes",
    tags: ["studio tour", "team", "behind the scenes", "workspace"],
    status: "published",
    publishedAt: "2024-01-12T11:00:00Z",
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-12T11:00:00Z",
    views: 12567,
  },
  {
    id: "video_4",
    title: "Episode 15 Preview - The Final Confrontation",
    description:
      "Get an exclusive preview of our upcoming Episode 15, featuring the climactic confrontation between our heroes and the main antagonist. This preview includes never-before-seen footage and hints at major plot developments.",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/placeholder.svg?height=360&width=640&text=Episode+15+Preview",
    duration: "2:30",
    category: "Preview",
    tags: ["episode 15", "preview", "confrontation", "exclusive"],
    status: "draft",
    publishedAt: "2024-01-25T18:00:00Z",
    createdAt: "2024-01-20T16:00:00Z",
    updatedAt: "2024-01-22T10:30:00Z",
    views: 0,
  },
]

export const sampleComments: Comment[] = [
  {
    id: "comment_1",
    postId: "blog_1",
    postType: "blog",
    author: "AnimeEnthusiast92",
    email: "fan@example.com",
    website: "https://animeblog.example.com",
    content:
      "This is such an insightful article! I've been following Flavor Studios for years and your storytelling techniques are absolutely incredible. The way you develop characters feels so natural and authentic. Can't wait to see what you create next!",
    status: "approved",
    createdAt: "2024-01-16T14:22:00Z",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  {
    id: "comment_2",
    postId: "video_1",
    postType: "video",
    author: "CreativeArtist",
    email: "artist@example.com",
    content:
      "The animation quality in your showreel is phenomenal! As an aspiring animator, I'm constantly inspired by your work. The attention to detail in every frame is remarkable. Do you have any plans for animation workshops or tutorials?",
    status: "pending",
    createdAt: "2024-01-17T09:15:00Z",
    ip: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  },
  {
    id: "comment_3",
    postId: "blog_2",
    postType: "blog",
    author: "ProductionNerd",
    email: "production@example.com",
    content:
      "Thanks for sharing your production process! It's fascinating to see how much work goes into each episode. The storyboarding phase seems particularly intensive. How long does it typically take to complete the storyboard for a full episode?",
    status: "approved",
    createdAt: "2024-01-18T16:45:00Z",
    ip: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  {
    id: "comment_4",
    postId: "video_2",
    postType: "video",
    author: "FightSceneFan",
    email: "fights@example.com",
    content:
      "Akira's fighting scene was absolutely epic! The breakdown video really helps understand the complexity behind what looks effortless on screen. The timing and choreography are perfect. More breakdown videos please!",
    status: "approved",
    createdAt: "2024-01-19T12:30:00Z",
    ip: "192.168.1.103",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  },
  {
    id: "comment_5",
    postId: "blog_1",
    postType: "blog",
    author: "SpamBot123",
    email: "spam@badsite.com",
    website: "https://suspicious-link.com",
    content:
      "Check out this amazing deal on anime merchandise! Click here for 90% off everything! Limited time offer! Buy now or regret forever! Amazing prices guaranteed!",
    status: "spam",
    createdAt: "2024-01-20T03:22:00Z",
    ip: "192.168.1.999",
    userAgent: "Bot/1.0",
  },
  {
    id: "comment_6",
    postId: "video_3",
    postType: "video",
    author: "StudioVisitor",
    email: "visitor@example.com",
    content:
      "The studio tour was amazing! Your workspace looks so creative and inspiring. I love how organized everything is while still maintaining that artistic atmosphere. The team seems really passionate about their work.",
    status: "pending",
    createdAt: "2024-01-21T11:18:00Z",
    ip: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
]
