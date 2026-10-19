import { describe, expect, it } from "vitest";

import { cn, getInitials } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });

  it("lets the last conflicting utility win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("p-2", false && "hidden", undefined, null)).toBe("p-2");
  });
});

describe("getInitials", () => {
  it("uses the first letter of the first two words", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("handles a single name", () => {
    expect(getInitials("Prince")).toBe("P");
  });

  it("falls back to a placeholder for missing names", () => {
    expect(getInitials(null)).toBe("?");
    expect(getInitials("")).toBe("?");
    expect(getInitials()).toBe("?");
  });
});
