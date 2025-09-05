// Flexible, forward-compatible media types used across admin UI and server.
// - Keeps your existing fields but avoids type drift between client and server.
// - Timestamps allow number | string to support Firestore and legacy shapes.

export type TypeFilter = "all" | "image" | "video" | "audio" | "application";

// Date range filter for media library
export type DateFilter = "all" | "7d" | "30d";

// Sorting options for the media library
export type SortBy = "date" | "name" | "size";

// Sort direction for media library
export type SortOrder = "asc" | "desc";

// Usage filter for media library (all files, only used, or only unused)
export type UsageFilter = "all" | "used" | "unused";

export interface MediaVariant {
  id?: string;
  url?: string;          // public URL (if available)
  path?: string;         // storage path (e.g., media/<id>/variant-name)
  width?: number;
  height?: number;
  size?: number;         // bytes
  mime?: string;         // mime type of the variant
  label?: string;        // e.g., "thumb", "crop-large"
  type?: string;         // e.g., "crop", "resize"
  createdAt?: number | string;
  createdBy?: string;
  /**
   * Expiration timestamp for signed URLs (ms since epoch).
   * Admin dashboard should refresh the URL once this time has passed.
   */
  urlExpiresAt?: number;
}

export interface MediaDoc {
  // Required
  id: string;
  url: string;
  /**
   * Expiration timestamp for signed URLs (ms since epoch).
   * Admin dashboard should refresh the URL once this time has passed.
   */
  urlExpiresAt?: number;

  // Names
  name?: string;         // optional logical name
  filename?: string;     // original filename
  basename?: string;     // for search prefix (lowercased, no extension)
  ext?: string;          // ".jpg", ".png", etc.

  // Type & size
  mime?: string;         // server-populated
  mimeType?: string;     // legacy/client-populated
  size?: number;         // bytes

  // Media attributes
  width?: number;
  height?: number;

  // Metadata
  alt?: string;
  tags?: string[];
  createdBy?: string;
  favorite?: boolean;    // ⭐ favorites filter/toggle

  /** IDs of posts or documents that use this media. Empty/undefined means unused. */
  attachedTo?: string[];

  variants?: MediaVariant[];

  // Timestamps (accept both Firestore number and string ISO)
  createdAt: number | string;
  updatedAt: number | string;
}
