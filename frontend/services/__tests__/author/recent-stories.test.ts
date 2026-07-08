import { fetchRecentStories } from "@/services/author"; 
import { authFetch } from "@/api/auth";

// 1. Jest mock syntax (Notice 'jest.mock' instead of 'vi.mock')
jest.mock("@/api/auth", () => ({
  authFetch: jest.fn(),
}));

describe("fetchRecentStories() - Next.js Jest Integration Test", () => {
  const mockToken = "mock-next-auth-jwt";

  beforeEach(() => {
    // 2. Clear out mock histories between tests
    jest.resetAllMocks();
  });

  it("should successfully parse and return stories on a 200 OK response", async () => {
    // Arrange: Mock data matching your RecentStoryRecord[] structure
    const mockBackendPayload = {
      stories: [
        {
          id: "1",
          title: "Next.js App Router Guide",
          imageUrl: "/cover.jpg",
          published: true,
          updatedAt: "2026-07-03T16:00:00Z",
        },
        {
          id: "2",
          title: "Next.js App Router Guide 2",
          imageUrl: "/cover.jpg",
          published: false,
          updatedAt: "2025-07-03T16:00:00Z",
        },
      ],
    };

    // 3. Use jest.mocked() to get typescript typing for the mocked function
    jest.mocked(authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackendPayload,
    } as Response);

    // Act: Call your Next.js API client function
    const result = await fetchRecentStories(mockToken);

    // Assert: Verify authFetch was called with the correct Next.js env URL & structure
    expect(authFetch).toHaveBeenCalledWith(
      `${process.env.BACKEND_URL}/author/my-stories/recent`, 
      mockToken,
      { method: "GET" }
    );

    // Verify the data was unwrapped correctly
    expect(result).toEqual(mockBackendPayload.stories);
    expect(result[0].title).toBe("Next.js App Router Guide");
  });

  it("should throw an error when the response is not ok (e.g., 401 or 500)", async () => {
    // Arrange: Simulate a failed network response
    jest.mocked(authFetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    // Act & Assert: Expect the function to throw the exact error message
    await expect(fetchRecentStories(mockToken)).rejects.toThrow(
      "Failed to fetch recent stories"
    );
  });
});