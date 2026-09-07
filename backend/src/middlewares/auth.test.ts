import { describe, it, expect, vi, afterEach } from "vitest";
import type { Request, Response } from "express";
import { requireApiToken } from "./auth";
import { AppError } from "../utils/AppError";

const TOKEN = "s3cret-token-of-decent-length";

function mockReq(authHeader?: string): Request {
  const get = (name: string) => (name.toLowerCase() === "authorization" ? authHeader : undefined);
  return { get } as unknown as Request;
}

const noopRes = {} as unknown as Response;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requireApiToken", () => {
  it("is a no-op (and warns) when no token is configured", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const next = vi.fn();

    requireApiToken(undefined)(mockReq(), noopRes, next);

    expect(next.mock.calls[0][0]).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it("calls next() with no error for a valid Bearer token", () => {
    const next = vi.fn();
    requireApiToken(TOKEN)(mockReq(`Bearer ${TOKEN}`), noopRes, next);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it("accepts a lowercase 'bearer' scheme", () => {
    const next = vi.fn();
    requireApiToken(TOKEN)(mockReq(`bearer ${TOKEN}`), noopRes, next);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it.each([
    ["missing header", undefined],
    ["empty header", ""],
    ["wrong token", "Bearer totally-the-wrong-value"],
    ["token without a scheme", TOKEN],
    ["basic scheme", `Basic ${TOKEN}`],
    ["prefix of the real token", `Bearer ${TOKEN.slice(0, -1)}`],
  ])("rejects %s with UNAUTHORIZED / 401", (_label, header) => {
    const next = vi.fn();
    requireApiToken(TOKEN)(mockReq(header as string | undefined), noopRes, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ code: "UNAUTHORIZED", statusCode: 401 });
  });
});
