/**
 * Scores a segment against search terms using simple term frequency.
 *
 * This is deliberately lexical, not semantic: Docify's grounding is keyword
 * search, and the product copy says so. Moving to Postgres full-text search is
 * a planned upgrade behind the same JSON contract.
 */
export function scoreSegmentContent(content: string, terms: string[]) {
  const haystack = content.toLowerCase();
  let score = 0;

  for (const term of terms) {
    let fromIndex = 0;
    let hits = 0;

    while (hits < 20) {
      const found = haystack.indexOf(term, fromIndex);

      if (found === -1) {
        break;
      }

      score += 1;
      hits += 1;
      fromIndex = found + term.length;
    }
  }

  return score;
}

export function tokenizeQuery(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
}
