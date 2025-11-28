import type { ContactSubmission } from "./types";

const inbox: ContactSubmission[] = [];

interface ContactInput {
  firstName: string;
  lastName?: string;
  email: string;
  subject?: string;
  message: string;
}

function createId(): string {
  return `contact_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function submitContactMessage(input: ContactInput): Promise<ContactSubmission> {
  if (!input.firstName || !input.email || !input.message) {
    throw new Error("firstName, email, and message are required");
  }
  const record: ContactSubmission = {
    id: createId(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    subject: input.subject,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  inbox.unshift(record);
  if (inbox.length > 500) {
    inbox.length = 500;
  }
  return record;
}