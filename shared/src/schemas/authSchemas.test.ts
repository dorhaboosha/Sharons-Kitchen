import { describe, it, expect } from "vitest";
import { LoginSchema } from "./login";
import { PasswordSchema } from "./password";

describe("LoginSchema", () => {
  it("normalizes the email (trim + lowercase) and passes the password through", () => {
    const result = LoginSchema.parse({
      email: "  Sharon@Example.COM ",
      password: "hunter2hunter2",
    });
    expect(result).toEqual({ email: "sharon@example.com", password: "hunter2hunter2" });
  });

  it("rejects a malformed email", () => {
    expect(LoginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(LoginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("does not impose a length floor on the login password", () => {
    expect(LoginSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(true);
  });
});

describe("PasswordSchema", () => {
  it("accepts a password of at least 10 characters", () => {
    expect(PasswordSchema.safeParse("0123456789").success).toBe(true);
  });

  it("rejects a password shorter than 10 characters", () => {
    expect(PasswordSchema.safeParse("012345678").success).toBe(false);
  });

  it("rejects an over-long password", () => {
    expect(PasswordSchema.safeParse("x".repeat(201)).success).toBe(false);
  });
});
