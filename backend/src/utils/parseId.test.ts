import { describe, it, expect } from "vitest";
import { parseId } from "./parseId";
import { AppError } from "./AppError";

describe("parseId", () => {
  it("parses a positive integer string", () => {
    expect(parseId("1")).toBe(1);
    expect(parseId("42")).toBe(42);
  });

  it("trims surrounding whitespace (Number() semantics)", () => {
    expect(parseId(" 3 ")).toBe(3);
  });

  it.each(["0", "-1", "1.5", "abc", "", "  ", "NaN", undefined, null, 5, {}])(
    "rejects invalid id %j",
    (raw) => {
      expect(() => parseId(raw as unknown)).toThrow(AppError);
    },
  );

  it("attaches VALIDATION_ERROR / 400 to the thrown error", () => {
    try {
      parseId("nope");
      throw new Error("expected parseId to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ code: "VALIDATION_ERROR", statusCode: 400 });
    }
  });

  // Known gap: Number() also accepts exponential / hex literals, so these
  // pass through today. Route params are always plain decimal strings in
  // practice; this test documents the behavior so tightening it later is a
  // deliberate change.
  it("currently accepts exponential and hex numeric strings", () => {
    expect(parseId("1e3")).toBe(1000);
    expect(parseId("0x10")).toBe(16);
  });
});
