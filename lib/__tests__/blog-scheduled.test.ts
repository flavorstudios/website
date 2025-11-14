import type { BlogPost } from "@/lib/types";

describe("blogStore scheduled posts", () => {
  class FakeDocument {
    private data?: BlogPost;
    private revisions: unknown[] = [];

    async get() {
      return {
        exists: this.data !== undefined,
        data: () => this.data,
      };
    }

    async set(value: BlogPost | Partial<BlogPost>, options?: { merge?: boolean }) {
      if (options?.merge) {
        this.data = { ...(this.data ?? ({} as BlogPost)), ...(value as Partial<BlogPost>) } as BlogPost;
      } else {
        this.data = value as BlogPost;
      }
    }

    collection(name: string) {
      if (name !== "revisions") {
        throw new Error(`Unsupported subcollection: ${name}`);
      }
      return {
        add: async (entry: unknown) => {
          this.revisions.push(entry);
          return { id: `revision_${this.revisions.length}` };
        },
      };
    }
  }

  class FakeCollection {
    private docs = new Map<string, FakeDocument>();

    doc(id: string) {
      if (!this.docs.has(id)) {
        this.docs.set(id, new FakeDocument());
      }
      return this.docs.get(id)!;
    }
  }

  class FakeFirestore {
    private collections = new Map<string, FakeCollection>();

    collection(name: string) {
      if (!this.collections.has(name)) {
        this.collections.set(name, new FakeCollection());
      }
      return this.collections.get(name)!;
    }
  }

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_TEST_MODE = "1";
  });

  it("preserves scheduledFor across updates", async () => {
    const fakeDb = new FakeFirestore();
    jest.doMock("@/lib/firebase-admin", () => ({
      getAdminDb: jest.fn(() => fakeDb),
    }));
    jest.doMock("@/lib/media", () => ({
      ensureFreshMediaUrl: jest.fn(async (url: string) => url),
      extractMediaIds: jest.fn(() => []),
      linkMediaToPost: jest.fn(),
      unlinkMediaFromPost: jest.fn(),
    }));

    const { blogStore } = (await import("@/lib/content-store")) as typeof import("@/lib/content-store");

    const initialSchedule = new Date("2025-06-15T12:30:00.000Z").toISOString();

    const created = await blogStore.create({
      title: "Scheduled Post",
      slug: "scheduled-post",
      content: "<p>Hello world</p>",
      excerpt: "Hello world",
      status: "draft",
      category: "news",
      categories: ["news"],
      tags: [],
      featuredImage: "/image.png",
      seoTitle: "Scheduled Post",
      seoDescription: "Scheduled Post",
      author: "Tester",
      publishedAt: initialSchedule,
      readTime: "1 min read",
      scheduledFor: initialSchedule,
    });

    expect(created.scheduledFor).toBe(initialSchedule);

    const updatedSchedule = new Date("2025-07-01T08:15:00.000Z").toISOString();

    const scheduled = await blogStore.update(
      created.id,
      { status: "scheduled", scheduledFor: updatedSchedule },
      "tester",
    );

    expect(scheduled?.scheduledFor).toBe(updatedSchedule);

    const afterEdit = await blogStore.update(
      created.id,
      { title: "Updated title" },
      "tester",
    );

    expect(afterEdit?.scheduledFor).toBe(updatedSchedule);

    const fetched = await blogStore.getById(created.id);
    expect(fetched?.scheduledFor).toBe(updatedSchedule);
  });
});