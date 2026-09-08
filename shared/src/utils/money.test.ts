import { describe, it, expect } from "vitest";
import { agorotToShekels, shekelsToAgorot, formatShekels } from "./money";

describe("agorotToShekels", () => {
  it("divides by 100", () => {
    expect(agorotToShekels(4000)).toBe(40);
    expect(agorotToShekels(1290)).toBe(12.9);
    expect(agorotToShekels(0)).toBe(0);
  });
});

describe("shekelsToAgorot", () => {
  it("multiplies by 100", () => {
    expect(shekelsToAgorot(40)).toBe(4000);
    expect(shekelsToAgorot(12.9)).toBe(1290);
  });

  it("rounds to the nearest agora", () => {
    expect(shekelsToAgorot(12.999)).toBe(1300);
    expect(shekelsToAgorot(12.994)).toBe(1299);
  });

  it("round-trips with agorotToShekels", () => {
    for (const a of [1, 100, 1290, 4000, 999_999]) {
      expect(shekelsToAgorot(agorotToShekels(a))).toBe(a);
    }
  });
});

describe("formatShekels", () => {
  it("renders two decimal places with a shekel sign", () => {
    expect(formatShekels(4000)).toBe("₪40.00");
    expect(formatShekels(1290)).toBe("₪12.90");
    expect(formatShekels(5)).toBe("₪0.05");
  });
});
