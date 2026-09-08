import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("../services/authService", () => ({
  resolveSession: vi.fn(),
}));

import { requireUser, extractBearerToken } from "./auth";
import { resolveSession } from "../services/authService";
import { AppError } from "../utils/AppError";

const resolveSessionMock = vi.mocked(resolveSession);

function mockReq(authHeader?: string): Request {
  const get = (name: string) => (name.toLowerCase() === "authorization" ? authHeader : undefined);
  return { get } as unknown as Request;
}

const noopRes = {} as unknown as Response;
const flush = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("extractBearerToken", () => {
  it.each([
    ["Bearer abc.def", "abc.def"],
    ["bearer abc.def", "abc.def"],
    ["Bearer   padded  ", "padded"],
  ])("pulls the token from %j", (header, expected) => {
    expect(extractBearerToken(mockReq(header))).toBe(expected);
  });

  it.each([[undefined], [""], ["abc.def"], ["Basic abc.def"]])("returns null for %j", (header) => {
    expect(extractBearerToken(mockReq(header as string | undefined))).toBeNull();
  });
});

describe("requireUser", () => {
  it("populates req.user and calls next() with no error for a valid token", async () => {
    const user = { id: 1, email: "a@b.com", displayName: "שרון" };
    resolveSessionMock.mockResolvedValue(user);
    const req = mockReq("Bearer good-token");
    const next = vi.fn();

    requireUser(req, noopRes, next);
    await flush();

    expect(resolveSessionMock).toHaveBeenCalledWith("good-token");
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it.each([
    ["missing header", undefined],
    ["empty header", ""],
    ["no scheme", "just-a-token"],
    ["basic scheme", "Basic just-a-token"],
  ])(
    "rejects %s with UNAUTHORIZED / 401 without hitting the session store",
    async (_label, header) => {
      const next = vi.fn();

      requireUser(mockReq(header as string | undefined), noopRes, next);
      await flush();

      expect(resolveSessionMock).not.toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ code: "UNAUTHORIZED", statusCode: 401 });
    },
  );

  it("rejects a well-formed but unknown/expired token with UNAUTHORIZED / 401", async () => {
    resolveSessionMock.mockResolvedValue(null);
    const req = mockReq("Bearer stale-token");
    const next = vi.fn();

    requireUser(req, noopRes, next);
    await flush();

    expect(req.user).toBeUndefined();
    expect(next.mock.calls[0][0]).toMatchObject({ code: "UNAUTHORIZED", statusCode: 401 });
  });

  it("forwards an unexpected store error to next()", async () => {
    const boom = new Error("db down");
    resolveSessionMock.mockRejectedValue(boom);
    const next = vi.fn();

    requireUser(mockReq("Bearer whatever"), noopRes, next);
    await flush();

    expect(next).toHaveBeenCalledWith(boom);
  });
});
