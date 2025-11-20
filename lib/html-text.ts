/**
 * Deterministically converts HTML to plain text without using regex-based parsing.
 * The linear scan avoids catastrophic backtracking while still stripping tags.
 */
export function extractPlainTextFromHtml(html: string): string {
  if (!html) return "";

  let text = "";
  let insideTag = false;
  let tagStart = -1;

  for (let i = 0; i < html.length; i += 1) {
    const char = html[i];
    if (!insideTag) {
      if (char === "<") {
        insideTag = true;
        tagStart = i;
        continue;
      }
      text += char;
      continue;
    }

    if (char === ">") {
      insideTag = false;
      tagStart = -1;
    }
  }

  // If the HTML ended while inside a tag, treat the opening '<' as literal text
  // to avoid dropping trailing content.
  if (insideTag && tagStart !== -1) {
    text += html.slice(tagStart);
  }

  return text;
}