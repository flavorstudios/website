const path = require("node:path");

function isPageFile(filename) {
  const normalized = filename.split(path.sep).join("/");
  return /app\/(?:\(admin\)|admin)\/.+\/page\.(?:t|j)sx?$/.test(normalized);
}

const ALLOWED_COMPONENT_FILES = new Set([
  "components/admin/page-header.tsx",
  "app/admin/dashboard/AdminDashboardPageClient.tsx",
  "app/admin/dashboard/components/blog-editor.tsx",
  "app/admin/comments/AdminCommentsPageClient.tsx",
  "app/admin/login/AdminLoginForm.tsx",
  "app/admin/forgot-password/ForgotPasswordForm.tsx",
  "app/admin/verify-email/VerifyEmailClient.tsx",
  "app/admin/search/AdminSearchPageClient.tsx",
]);

function isAllowedComponent(filename) {
  const normalized = filename.split(path.sep).join("/");
  return ALLOWED_COMPONENT_FILES.has(normalized);
}

function isLevelOne(attribute) {
  if (!attribute || attribute.type !== "JSXAttribute") return true;
  const value = attribute.value;
  if (!value) return true;
  if (value.type === "Literal" && value.value === 1) {
    return true;
  }
  if (value.type === "Literal" && value.value === "1") {
    return true;
  }
  if (value.type === "JSXExpressionContainer") {
    const expr = value.expression;
    if (expr.type === "Literal" && expr.value === 1) return true;
    if (expr.type === "Literal" && expr.value === "1") return true;
    if (expr.type === "UnaryExpression" && expr.operator === "+" && expr.argument.type === "Literal" && expr.argument.value === 1) {
      return true;
    }
    if (expr.type === "TSAsExpression" && expr.expression && expr.expression.type === "Literal" && expr.expression.value === 1) {
      return true;
    }
    if (expr.type === "Identifier" && expr.name === "LEVEL_ONE_PAGE_HEADER") {
      // simple constant allow-list if project defines a shared constant
      return true;
    }
  }
  return false;
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow <h1> and PageHeader level=1 outside admin page entry points",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    if (!filename || filename === "<text>" || filename.includes("node_modules")) {
      return {};
    }

    if (filename.includes(`${path.sep}components${path.sep}admin${path.sep}page-header.tsx`)) {
      return {};
    }

    const normalized = filename.split(path.sep).join("/");

    if (
      !normalized.includes("/app/admin") &&
      !normalized.includes("/app/(admin)") &&
      !normalized.includes("components/admin")
    ) {
      return {};
    }

    function report(node, message) {
      context.report({ node, message });
    }

    return {
      JSXOpeningElement(node) {
        const name = node.name;
        if (name.type === "JSXIdentifier" && name.name === "h1") {
          if (!isPageFile(normalized) && !isAllowedComponent(normalized)) {
            report(node, "<h1> is only allowed within admin page entry files or the PageHeader component.");
          }
        }

        if (name.type === "JSXIdentifier" && name.name === "PageHeader") {
          const levelAttr = node.attributes.find(
            (attr) => attr.type === "JSXAttribute" && attr.name && attr.name.name === "level"
          );
          const rendersLevelOne = levelAttr ? isLevelOne(levelAttr) : true;
          if (rendersLevelOne && !isPageFile(normalized) && !isAllowedComponent(normalized)) {
            report(node, "PageHeader with level={1} must live in an admin page entry file.");
          }
        }
      },
    };
  },
};