export interface MediaVariant {
  // --- Your original fields ---
  url: string;
  width: number;
  height: number;

  // --- Optional extensions (non-breaking) ---
  /** Internal identifier for a generated/cropped variant */
  id?: string;
  /** Storage path if different from public URL */
  path?: string;
  /** Byte size of this variant */
  size?: number;
  /** MIME type of this variant (e.g., image/webp) */
  mime?: string;
  /** Optional quality/format metadata */
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png" | "svg" | "gif";
  /** Audit metadata */
  createdAt?: number;
  createdBy?: string;
  /** Variant categorization (e.g., "crop", "thumb", "large") */
  type?: string;
  label?: string;
}

export interface MediaVersion {
  /** Stable ID so a specific version can be restored */
  versionId: string;
  /** Public URL of the archived file */
  url: string;
  /** Original filename at the time of replacement */
  filename: string;
  /** MIME of the archived file */
  mimeType: string;
  /** Byte size of the archived file */
  size: number;
  /** Dimensions if known (for images) */
  width?: number;
  height?: number;
  /** When it was archived (epoch ms) */
  replacedAt: number;
  /** Who performed the replace */
  replacedBy: string;
}

export interface MediaDoc {
  // --- Your original required fields (unchanged) ---
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  createdAt: string;   // keep for backward compatibility
  updatedAt: string;   // keep for backward compatibility

  // --- Optional extensions (non-breaking) ---

  /** Canonical filename; kept optional to preserve your existing `name` */
  filename?: string;
  /** Legacy/alternate MIME alias to support older docs */
  mime?: string;

  /** CDN-accelerated URL if available */
  cdnUrl?: string;

  /** Human metadata */
  title?: string;
  caption?: string;
  description?: string;
  tags?: string[];

  /** Numeric timestamps (epoch ms) to coexist with your string dates */
  createdAtMs?: number;
  updatedAtMs?: number;

  /** Dimensions for images */
  width?: number;
  height?: number;

  /** Storage helpers for search/filter */
  basename?: string; // e.g., "my-hero-image"
  ext?: string;      // e.g., ".png"

  /** Audit */
  createdBy?: string;
  updatedBy?: string;

  /** Responsive or edited variants */
  variants?: MediaVariant[];

  /** Version history for replace/restore flows */
  versions?: MediaVersion[];

  /** Normalized focal point for smart cropping (0..1) */
  focalPoint?: { x: number; y: number };

  /** Stable storage path for the original blob */
  storagePath?: string;

  // --- Organization & favorites ---
  /** Parent folder/collection; default "root" when backfilled */
  folderId?: string;
  /** Starred/favorite flag */
  starred?: boolean;
  /** Last time it was accessed (epoch ms) for "Recent" */
  lastAccessed?: number;

  // --- Attachment helpers (for attach/detach UX) ---
  /** Whether attached to any entity (derived or stored) */
  attached?: boolean;
  /** Identifier(s) of the attached entity (post/page id, etc.) */
  attachedTo?: string | string[];
}
