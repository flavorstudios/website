import Image from "next/image";
import { Calendar, FileText } from "lucide-react";

import { isAllowedImageUrl } from "@/lib/image-domains";
import { safeDateLabel } from "@/lib/safe-date";

export interface SimpleBlogFallbackProps {
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null | Date;
  author?: string | null;
}

export default function SimpleBlogFallback({
  title,
  excerpt,
  coverImage,
  publishedAt,
  author,
}: SimpleBlogFallbackProps) {
  const publishedLabel = safeDateLabel(publishedAt, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const allowedImage = coverImage && isAllowedImageUrl(coverImage);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
          {title}
        </h1>
        {excerpt && (
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">{excerpt}</p>
        )}
        <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
          {author && <span>{author}</span>}
          {publishedLabel && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {publishedLabel}
            </span>
          )}
        </div>
      </header>

      {coverImage && (
        <div className="mb-10 relative w-full h-60 md:h-72 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            priority={Boolean(allowedImage)}
            loading={allowedImage ? undefined : "lazy"}
            unoptimized={!allowedImage}
          />
        </div>
      )}

      <div className="bg-white border border-dashed border-gray-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <FileText className="h-10 w-10 text-gray-400" aria-hidden="true" />
        </div>
        <p className="text-base text-gray-600">
          We couldn&apos;t load the full article content right now, but you can
          still read the summary above. Please check back later for the complete
          story.
        </p>
      </div>
    </article>
  );
}