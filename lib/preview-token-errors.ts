export class InvalidPreviewTokenError extends Error {
  override name = "InvalidPreviewTokenError";
  code = "INVALID_PREVIEW_TOKEN";

  constructor(message = "Invalid token.") {
    super(message);
  }
}

export class ExpiredPreviewTokenError extends Error {
  override name = "ExpiredPreviewTokenError";
  code = "EXPIRED_PREVIEW_TOKEN";

  constructor(message = "Preview token expired.") {
    super(message);
  }
}