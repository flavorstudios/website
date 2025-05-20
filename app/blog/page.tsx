import Link from "next/link"

const categories = ["technology", "travel", "food", "lifestyle", "music"]

export default function BlogPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      <p className="mb-4">Welcome to our blog! Explore articles on various topics.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        <ul className="flex space-x-4">
          {categories.map((category) => (
            <li key={category}>
              <Link href={`/blog/category/${category}`} className="text-blue-500 hover:underline">
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Example blog posts (replace with actual data fetching) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Post Title 1</h3>
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
          <Link href="/blog/post-1" className="text-blue-500 hover:underline mt-2 block">
            Read More
          </Link>
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Post Title 2</h3>
          <p className="text-gray-700">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <Link href="/blog/post-2" className="text-blue-500 hover:underline mt-2 block">
            Read More
          </Link>
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Post Title 3</h3>
          <p className="text-gray-700">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <Link href="/blog/post-3" className="text-blue-500 hover:underline mt-2 block">
            Read More
          </Link>
        </div>
      </div>
    </div>
  )
}
