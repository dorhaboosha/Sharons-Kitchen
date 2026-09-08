import { describe, it, expect } from "vitest";
import { normalizeName } from "./normalizeName";

describe("normalizeName", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeName("  קובה סלק  ")).toBe("קובה סלק");
  });

  it("collapses runs of internal whitespace to a single space", () => {
    expect(normalizeName("קובה     סלק")).toBe("קובה סלק");
  });

  it("collapses tabs and newlines as well as spaces", () => {
    expect(normalizeName("קובה\t\n  סלק")).toBe("קובה סלק");
  });

  it("leaves an already-normalized name unchanged", () => {
    expect(normalizeName("קציצות ברוטב")).toBe("קציצות ברוטב");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(normalizeName("   ")).toBe("");
  });

  it("does not change letter casing", () => {
    expect(normalizeName("  Falafel Balls ")).toBe("Falafel Balls");
  });
});
