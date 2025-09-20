# Release Notes

## Enhancements
- Sanitised blog content to prevent XSS.
- Added descriptive alt text and scope attributes for tables.
- Introduced mobile drawer sidebar with focus trap and bottom navigation.
- Responsive card layouts for Media and Blog tables on small screens.
- Configured toast placement and accessibility improvements across forms.
- Added automated axe test and eslint a11y plugin.
- Added admin self-service signup with inline validation, password guidance, and rate limiting.
- Introduced mandatory email verification gate with resend flow and disposable domain blocking.

## Setup
- Install dependencies: `pnpm install`
- Run lint: `pnpm lint`
- Run unit tests: `pnpm test`
- Build (requires Firebase env vars): `pnpm build`