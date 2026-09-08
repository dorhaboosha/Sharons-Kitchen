import { describe, it, expect, vi, afterEach } from "vitest";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { errorHandler } from "./errorHandler";
import { AppError } from "../utils/AppError";

type CapturedRes = Response & { statusCode: number; body: unknown };

function mockRes(): CapturedRes {
  const res = {} as CapturedRes;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  }) as unknown as Response["status"];
  res.json = vi.fn((body: unknown) => {
    res.body = body;
    return res;
  }) as unknown as Response["json"];
  return res;
}

function run(err: unknown): CapturedRes {
  const res = mockRes();
  errorHandler(err, {} as Request, res, vi.fn());
  return res;
}

const knownError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError(`test ${code}`, {
    code,
    clientVersion: "6.0.0",
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("errorHandler", () => {
  it("passes an AppError through with its status, code and message", () => {
    const res = run(new AppError("VALIDATION_ERROR", 400, "לא תקין"));
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "לא תקין" },
    });
  });

  it("maps a Prisma P2002 unique-constraint error to 409 CONFLICT", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = run(knownError("P2002"));
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({ success: false, error: { code: "CONFLICT" } });
    expect(errSpy).not.toHaveBeenCalled();
  });

  it("maps a Prisma P2025 record-not-found error to 404 NOT_FOUND", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = run(knownError("P2025"));
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: { code: "NOT_FOUND" } });
    expect(errSpy).not.toHaveBeenCalled();
  });

  it("falls through to 500 for other Prisma known errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = run(knownError("P2003"));
    expect(res.statusCode).toBe(500);
    expect(res.body).toMatchObject({ success: false, error: { code: "INTERNAL_ERROR" } });
  });

  it("returns 500 INTERNAL_ERROR for an unexpected error and logs it", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = run(new Error("boom"));
    expect(res.statusCode).toBe(500);
    expect(res.body).toMatchObject({ success: false, error: { code: "INTERNAL_ERROR" } });
    expect(errSpy).toHaveBeenCalled();
  });

  it("returns 500 for a non-Error thrown value", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = run("just a string");
    expect(res.statusCode).toBe(500);
    expect(res.body).toMatchObject({ success: false, error: { code: "INTERNAL_ERROR" } });
  });
});
