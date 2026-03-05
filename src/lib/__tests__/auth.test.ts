import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

// Mock server-only so the module can be imported in tests
vi.mock("server-only", () => ({}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

// Shared mock for the cookies store
const mockCookieStore = {
  get: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Import after mocks are set up
const { getSession } = await import("@/lib/auth");

async function makeToken(
  payload: Record<string, unknown>,
  expiresIn = "7d"
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null when no auth-token cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const session = await getSession();

    expect(session).toBeNull();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
  });

  test("returns session payload for a valid token", async () => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = await makeToken({
      userId: "user-123",
      email: "test@example.com",
      expiresAt: expiresAt.toISOString(),
    });
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("user-123");
    expect(session?.email).toBe("test@example.com");
  });

  test("returns null for an expired token", async () => {
    const token = await makeToken(
      { userId: "user-123", email: "test@example.com" },
      "-1s" // already expired
    );
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns null for a token signed with a different secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");
    const token = await new SignJWT({ userId: "user-123", email: "x@x.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .setIssuedAt()
      .sign(wrongSecret);
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns null for a malformed token string", async () => {
    mockCookieStore.get.mockReturnValue({ value: "not.a.valid.jwt" });

    const session = await getSession();

    expect(session).toBeNull();
  });
});
