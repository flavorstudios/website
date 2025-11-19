import type { CategoryType, CommentRecord, CreateCommentInput } from "./types";

const comments: CommentRecord[] = [
  {
    id: "fallback-comment-1",
    postId: "fallback-welcome-to-flavor-studios",
    postType: "blog",
    author: "Mina",
    content: "Loved reading this welcome note!",
    status: "approved",
    createdAt: "2024-04-10T12:00:00.000Z",
  },
];

const COMMENT_LIMIT = 1000;

function normalizeType(type?: CategoryType): CategoryType {
  return type === "video" ? "video" : "blog";
}

function generateId(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getCommentsForPost(
  postId: string,
  postType?: CategoryType,
): Promise<CommentRecord[]> {
  if (!postId) return [];
  const normalizedType = normalizeType(postType);
  return comments.filter((comment) => comment.postId === postId && comment.postType === normalizedType);
}

export async function addComment(input: CreateCommentInput): Promise<CommentRecord> {
  if (!input.postId || !input.author || !input.content) {
    throw new Error("postId, author, and content are required");
  }
  const record: CommentRecord = {
    id: generateId(),
    postId: input.postId,
    postType: normalizeType(input.postType),
    author: input.author,
    content: input.content,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  comments.unshift(record);
  if (comments.length > COMMENT_LIMIT) {
    comments.length = COMMENT_LIMIT;
  }
  return record;
}