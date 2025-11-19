import type { CareerSubmission } from "./types";

type CareerInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  skills?: string;
  portfolio?: string;
  message?: string;
};

const submissions: CareerSubmission[] = [];
const MAX_SUBMISSIONS = 1000;

function createId(): string {
  return `career_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function submitCareerApplication(input: CareerInput): Promise<CareerSubmission> {
  const email = (input.email ?? "").trim();
  if (!email) {
    throw new Error("Email is required");
  }

  const record: CareerSubmission = {
    id: createId(),
    firstName: (input.firstName ?? "").trim(),
    lastName: (input.lastName ?? "").trim() || undefined,
    email,
    skills: (input.skills ?? "").trim() || undefined,
    portfolio: (input.portfolio ?? "").trim() || undefined,
    message: (input.message ?? "").trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  submissions.unshift(record);
  if (submissions.length > MAX_SUBMISSIONS) {
    submissions.length = MAX_SUBMISSIONS;
  }

  return record;
}

export async function listCareerApplications(): Promise<CareerSubmission[]> {
  return submissions.slice();
}