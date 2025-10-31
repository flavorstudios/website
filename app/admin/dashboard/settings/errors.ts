export type SettingsErrorCode =
  | "UNAUTHORIZED"
  | "ADMIN_SDK_UNAVAILABLE"
  | "FIRESTORE_ERROR"
  | "EMAIL_TRANSPORT_UNCONFIGURED"
  | "ROLLBACK_INVALID"

export class SettingsAccessError extends Error {
  code: SettingsErrorCode

  constructor(code: SettingsErrorCode, message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = "SettingsAccessError"
    this.code = code
    if (options?.cause !== undefined) {
      ;(this as { cause?: unknown }).cause = options.cause
    }
  }
}