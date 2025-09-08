"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  embedUrl: string;
  thumbnailUrl: string;
  title: string;
}

export function VideoPlayer({ embedUrl, thumbnailUrl, title }: VideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full">
      {isLoaded ? (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsLoaded(true)}
          className="relative w-full h-full group"
        >
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors"
          >
            <Play className="h-16 w-16 text-white" aria-hidden="true" />
          </div>
        </button>
      )}
    </div>
  );
}