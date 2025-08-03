interface Stats {
  youtubeSubscribers?: number;
  originalEpisodes?: number;
  totalViews?: number;
  yearsCreating?: number;
}

export default function StatsSection({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
              {stats.youtubeSubscribers ?? "—"}
            </div>
            <div className="text-gray-600 font-medium">YouTube Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
              {stats.originalEpisodes ?? "—"}
            </div>
            <div className="text-gray-600 font-medium">Original Episodes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-cyan-600 mb-2">
              {stats.totalViews ?? "—"}
            </div>
            <div className="text-gray-600 font-medium">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
              {stats.yearsCreating ?? "—"}
            </div>
            <div className="text-gray-600 font-medium">Years Creating</div>
          </div>
        </div>
      </div>
    </section>
  );
}