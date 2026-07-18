import assert from "node:assert/strict";
import test from "node:test";
import { containsContactInfo, passwordSchema, registerSchema } from "../src/lib/validation";

test("password policy requires a letter, number and eight characters", () => {
  assert.equal(passwordSchema.safeParse("password").success, false);
  assert.equal(passwordSchema.safeParse("12345678").success, false);
  assert.equal(passwordSchema.safeParse("Guvenli123").success, true);
});

test("registration schema rejects invalid roles and emails", () => {
  assert.equal(registerSchema.safeParse({ name: "A", email: "bad", password: "Guvenli123", role: "ADMIN" }).success, false);
  assert.equal(registerSchema.safeParse({ name: "Ada Acar", email: "ada@example.com", password: "Guvenli123", role: "STUDENT" }).success, true);
});

test("contact leak filter catches phone, e-mail and URL", () => {
  assert.equal(containsContactInfo("Bana 0532 123 45 67 yaz"), true);
  assert.equal(containsContactInfo("test@example.com adresine gönder"), true);
  assert.equal(containsContactInfo("www.example.com adresine bak"), true);
  assert.equal(containsContactInfo("Platform üzerinden görüşelim"), false);
});
