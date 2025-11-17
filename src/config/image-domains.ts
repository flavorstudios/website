import imageDomains from "../../config/image-domains.json" assert { type: "json" };

const parsedDomains = Array.isArray(imageDomains)
  ? imageDomains.filter((domain): domain is string => typeof domain === "string" && !!domain.trim())
  : [];

export const IMAGE_DOMAINS = Object.freeze(parsedDomains);