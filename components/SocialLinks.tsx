"use client";

import SocialIcons from "@/components/SocialIcons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";

interface SocialLinksProps {
  platforms?: SocialPlatform[];
  showLabels?: boolean;
  className?: string;
}

export function SocialLinks({
  platforms = SOCIAL_PLATFORMS,   // Default is always the canonical array
  showLabels = false,
  className,
}: SocialLinksProps) {
  if (!showLabels) {
    return <SocialIcons platforms={platforms} className={className} />;
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3", className)}>
      {platforms.map(({ label, href, icon: Icon, color }) => (
        <Button
          key={label}
          variant="outline"
          asChild
          className="justify-start h-9 sm:h-10 text-xs sm:text-sm"
        >
          <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon className={cn("mr-2 h-4 w-4 sm:h-5 sm:w-5", color)} aria-hidden="true" />
            {label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

export default SocialLinks;
