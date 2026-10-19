import { describe, expect, it } from "vitest";

import { scoreSegmentContent, tokenizeQuery } from "@/lib/documents/search";

describe("tokenizeQuery", () => {
  it("lowercases and splits on punctuation", () => {
    expect(tokenizeQuery("The Quick, Brown-Fox!")).toEqual([
      "the",
      "quick",
      "brown",
      "fox",
    ]);
  });

  it("drops terms of two characters or fewer", () => {
    expect(tokenizeQuery("a an to the and")).toEqual(["the", "and"]);
  });

  it("returns an empty list for punctuation-only input", () => {
    expect(tokenizeQuery("!!! ...")).toEqual([]);
  });
});

describe("scoreSegmentContent", () => {
  it("counts case-insensitive occurrences", () => {
    expect(scoreSegmentContent("Clean code is clean CODE.", ["clean"])).toBe(2);
  });

  it("sums scores across terms", () => {
    expect(scoreSegmentContent("alpha beta alpha", ["alpha", "beta"])).toBe(3);
  });

  it("returns zero when nothing matches", () => {
    expect(scoreSegmentContent("alpha beta", ["gamma"])).toBe(0);
  });

  it("caps a single term at 20 hits", () => {
    expect(scoreSegmentContent("x".repeat(30), ["x"])).toBe(20);
  });

  it("matches substrings, which is why the product says keyword search", () => {
    expect(scoreSegmentContent("documentation", ["document"])).toBe(1);
  });
});
