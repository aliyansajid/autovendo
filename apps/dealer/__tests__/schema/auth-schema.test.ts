import { describe, it, expect } from "vitest";
import {
  createLoginSchema,
  createForgotPasswordSchema,
  createResetPasswordSchema,
  createUpdatePasswordSchema,
} from "@/schema/auth-schema";

const t = (key: string) => key;

describe("createLoginSchema", () => {
  const schema = createLoginSchema(t);

  it("accepts valid credentials", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "secret",
      rememberme: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = schema.safeParse({
      email: "not-an-email",
      password: "secret",
      rememberme: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "",
      rememberme: false,
    });
    expect(result.success).toBe(false);
  });

  it("requires rememberme boolean", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });
});

describe("createForgotPasswordSchema", () => {
  const schema = createForgotPasswordSchema(t);

  it("accepts valid email", () => {
    const result = schema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = schema.safeParse({ email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = schema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

describe("createResetPasswordSchema", () => {
  const schema = createResetPasswordSchema(t);

  it("accepts matching passwords of minimum length", () => {
    const result = schema.safeParse({
      password: "securepass",
      confirmPassword: "securepass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = schema.safeParse({
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-matching passwords", () => {
    const result = schema.safeParse({
      password: "securepass",
      confirmPassword: "differentpass",
    });
    expect(result.success).toBe(false);
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.confirmPassword).toBeDefined();
  });

  it("accepts exactly 8 character password", () => {
    const result = schema.safeParse({
      password: "12345678",
      confirmPassword: "12345678",
    });
    expect(result.success).toBe(true);
  });
});

describe("createUpdatePasswordSchema", () => {
  const schema = createUpdatePasswordSchema(t);

  it("accepts valid password update", () => {
    const result = schema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "newpassword",
      confirmPassword: "newpassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty currentPassword", () => {
    const result = schema.safeParse({
      currentPassword: "",
      newPassword: "newpassword",
      confirmPassword: "newpassword",
    });
    expect(result.success).toBe(false);
  });

  it("rejects newPassword shorter than 8 characters", () => {
    const result = schema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-matching confirmPassword", () => {
    const result = schema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "newpassword",
      confirmPassword: "mismatch",
    });
    expect(result.success).toBe(false);
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.confirmPassword).toBeDefined();
  });
});
