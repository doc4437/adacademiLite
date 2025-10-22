import { describe, expect, it } from "vitest";
import { formatDate, validateUrl } from "@/lib/utils";

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const formatted = formatDate("2024-05-14T00:00:00.000Z");
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("returns empty string for invalid date", () => {
    expect(formatDate("invalid" as unknown as string)).toBe("");
  });
});

describe("validateUrl", () => {
  it("accepts https URL", () => {
    const result = validateUrl("https://example.com");
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = validateUrl("not a url");
    expect(result.success).toBe(false);
  });
});
