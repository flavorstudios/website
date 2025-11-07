import { createRequire } from "node:module"
import path from "node:path"
import url from "node:url"

const require = createRequire(import.meta.url)
const { FlatCompat } = require("@eslint/eslintrc")

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const compat = new FlatCompat({ baseDirectory: __dirname })

const config = [
  {
    ignores: [
      "node_modules",
      ".next",
      "out",
      "coverage",
      "storybook",
      "public/vendor",
      "public/js",
      "functions",
      "firebase",
      "scripts",
      "test-results",
      "Patches",
      "types/jest/index.d.ts",
      "types/node/index.d.ts",
      "eslint-plugin-local/**",
      "test-utils/dom-mocks.ts",
    ],
  },
  ...compat.config(require("./.eslintrc.json")),
]

export default config