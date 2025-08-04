"use client";

import SocialIcons, { defaultPlatforms, type SocialPlatform } from "@/components/SocialIcons";

interface FollowUsProps {
  platforms?: SocialPlatform[];
}

export function FollowUs({ platforms = defaultPlatforms }: FollowUsProps) {
  return (
    <section aria-labelledby="follow-us-heading" className="space-y-4">
      <h3 id="follow-us-heading" className="font-semibold text-lg text-white">
        Follow us
      </h3>
      <SocialIcons
        platforms={platforms}
        className="justify-center md:justify-start gap-x-4"
        variant="color"
      />
    </section>
  );
}

export default FollowUs;
