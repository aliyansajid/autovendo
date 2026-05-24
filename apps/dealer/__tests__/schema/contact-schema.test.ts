import { describe, it, expect } from "vitest";
import { createContactFormSchema } from "@/schema/contact-schema";
import { createDealerContactSchema } from "@/schema/dealer-contact-schema";

const t = (key: string) => key;

describe("createContactFormSchema", () => {
  const schema = createContactFormSchema(t);

  it("accepts valid contact form data", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+41791234567",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = schema.safeParse({
      name: "Jo",
      email: "john@example.com",
      phone: "+41791234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = schema.safeParse({
      name: "A".repeat(51),
      email: "john@example.com",
      phone: "+41791234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      phone: "+41791234567",
    });
    expect(result.success).toBe(false);
  });

  it("accepts Swiss phone with +41 prefix", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+41791234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts Swiss phone with 0041 prefix", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "0041791234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts Swiss phone starting with 0", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "0791234567",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-Swiss phone number", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+49123456789",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty phone", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional subject and message", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+41791234567",
      subject: "Test subject",
      message: "Hello world",
    });
    expect(result.success).toBe(true);
  });

  it("rejects subject longer than 100 characters", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+41791234567",
      subject: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects message longer than 500 characters", () => {
    const result = schema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+41791234567",
      message: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("createDealerContactSchema", () => {
  const schema = createDealerContactSchema(t);

  it("accepts valid dealer contact data", () => {
    const result = schema.safeParse({
      name: "Jane Doe",
      phone: "+41791234567",
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = schema.safeParse({
      name: "Jo",
      phone: "+41791234567",
      email: "jane@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = schema.safeParse({
      name: "A".repeat(51),
      phone: "+41791234567",
      email: "jane@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = schema.safeParse({
      name: "Jane Doe",
      phone: "+41791234567",
      email: "bad-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty phone", () => {
    const result = schema.safeParse({
      name: "Jane Doe",
      phone: "",
      email: "jane@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional message", () => {
    const result = schema.safeParse({
      name: "Jane Doe",
      phone: "+41791234567",
      email: "jane@example.com",
      message: "I am interested in this vehicle.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects message longer than 1000 characters", () => {
    const result = schema.safeParse({
      name: "Jane Doe",
      phone: "+41791234567",
      email: "jane@example.com",
      message: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
