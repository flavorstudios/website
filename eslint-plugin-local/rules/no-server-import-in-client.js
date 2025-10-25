const { builtinModules } = require("module")

const NODE_BUILTINS = new Set(
  builtinModules.flatMap((name) => [name, name.startsWith("node:") ? name : `node:${name}`]),
)

const DISALLOWED_PATTERNS = [
  /^next\/(headers|cookies)$/,
  /^server-only$/,
  /^firebase-admin(\/.*)?$/,
  /^@\/lib\/firebase-admin/,
  /^@\/lib\/settings\/server$/,
]

function isDisallowedModule(value) {
  if (typeof value !== "string") return false
  if (NODE_BUILTINS.has(value) || NODE_BUILTINS.has(value.replace(/^node:/, ""))) {
    return true
  }
  return DISALLOWED_PATTERNS.some((pattern) => pattern.test(value))
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow importing server-only modules from client components",
    },
    schema: [],
    messages: {
      disallowedImport: 'Client components cannot import server-only module "{{value}}".',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode()
    const hasUseClient = sourceCode.ast.body.some(
      (node) =>
        node.type === "ExpressionStatement" &&
        node.expression.type === "Literal" &&
        node.expression.value === "use client",
    )

    if (!hasUseClient) {
      return {}
    }

    function checkModule(value, node) {
      if (isDisallowedModule(value)) {
        context.report({ node, messageId: "disallowedImport", data: { value } })
      }
    }

    return {
      ImportDeclaration(node) {
        checkModule(node.source.value, node.source)
      },
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length === 1 &&
          node.arguments[0].type === "Literal"
        ) {
          checkModule(node.arguments[0].value, node.arguments[0])
        }
      },
    }
  },
}