import { getPosts } from "../shared/src/posts";

describe("getPosts date validation", () => {
  it("throws when startDate is invalid", async () => {
    await expect(getPosts({ startDate: "not-a-date" })).rejects.toThrow("Invalid startDate");
  });

  it("throws when endDate is invalid", async () => {
    await expect(getPosts({ endDate: "13/35/2024" })).rejects.toThrow("Invalid endDate");
  });
});
