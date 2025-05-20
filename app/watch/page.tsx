import Link from "next/link"

const categories = ["movies", "series", "documentaries", "anime", "cartoons"]

const WatchPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Watch</h1>
      <p className="mb-4">Explore different categories of videos.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category} className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-lg font-semibold capitalize">{category}</h2>
            <p className="text-gray-600">Watch {category} videos.</p>
            <Link href={`/watch/category/${category}`} className="text-blue-500 hover:underline block mt-2">
              Watch Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WatchPage
