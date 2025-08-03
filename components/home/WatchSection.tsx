import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Eye, Clock, ArrowRight } from "lucide-react";
import ErrorFallback from "@/components/home/ErrorFallback";
import { formatDate } from "@/lib/date";

interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  publishedAt?: string;
}

export default function WatchSection({ videos }: { videos: Video[] }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Watch Our Originals</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our original anime content, behind-the-scenes footage, and exclusive video content.
          </p>
        </div>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {videos.slice(0, 6).map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title || "Anime video thumbnail"}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={false}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" aria-hidden="true" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                      {video.duration || "—"}
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 leading-tight">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" aria-hidden="true" />
                        {(video.views || 0).toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {video.publishedAt ? formatDate(video.publishedAt) : ""}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <ErrorFallback section="video content" />
        )}
        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="/watch">
              View All Videos
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}