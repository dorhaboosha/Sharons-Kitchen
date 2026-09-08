import { describe, it, expect } from "vitest";
import { parseEnv } from "./config";

const base = { DATABASE_URL: "postgresql://u:p@localhost:5432/db" };
const prodBase = {
  ...base,
  NODE_ENV: "production",
  FRONTEND_URL: "https://sharons-kitchen-frontend.onrender.com",
};

describe("parseEnv", () => {
  it("accepts a minimal valid environment and applies defaults", () => {
    const cfg = parseEnv({ ...base });
    expect(cfg).toMatchObject({
      NODE_ENV: "development",
      PORT: 3000,
      frontendUrl: "http://localhost:5173",
      isProduction: false,
    });
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("throws in production when FRONTEND_URL is missing", () => {
    expect(() => parseEnv({ ...base, NODE_ENV: "production" })).toThrow(/FRONTEND_URL/);
  });

  it("accepts a valid production environment", () => {
    const cfg = parseEnv({ ...prodBase });
    expect(cfg.isProduction).toBe(true);
    expect(cfg.frontendUrl).toBe("https://sharons-kitchen-frontend.onrender.com");
  });

  it("strips a trailing slash from FRONTEND_URL so it matches the browser origin", () => {
    const cfg = parseEnv({ ...base, FRONTEND_URL: "https://example.com/" });
    expect(cfg.frontendUrl).toBe("https://example.com");
  });

  it("rejects a non-URL FRONTEND_URL", () => {
    expect(() => parseEnv({ ...base, FRONTEND_URL: "not-a-url" })).toThrow(/FRONTEND_URL/);
  });

  it("coerces a numeric PORT string", () => {
    expect(parseEnv({ ...base, PORT: "8080" }).PORT).toBe(8080);
  });

  it("rejects a non-numeric PORT", () => {
    expect(() => parseEnv({ ...base, PORT: "abc" })).toThrow(/PORT/);
  });

  it("rejects an unknown NODE_ENV (e.g. a typo like 'prod')", () => {
    expect(() => parseEnv({ ...base, NODE_ENV: "prod" })).toThrow(/NODE_ENV/);
  });
});
