import { IconType } from "react-icons";
import { FaYoutube, FaFacebook, FaInstagram, FaDiscord, FaTelegram, FaRedditAlien } from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";

export const platformIcons: Record<string, IconType> = {
  youtube: FaYoutube,
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaXTwitter,
  discord: FaDiscord,
  telegram: FaTelegram,
  threads: FaThreads,
  reddit: FaRedditAlien,
};