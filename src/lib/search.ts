export function sanitize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function fuzzyMatch(query: string, target: string): boolean {
  const q = sanitize(query).trim()
  if (!q) return true

  const tokens = q.split(/\s+/)
  const lower = sanitize(target)
  return tokens.every((token) => lower.includes(token))
}

export function fuzzyScore(query: string, target: string): number {
  const q = sanitize(query)
  const t = sanitize(target)

  if (t.includes(q)) return q.length * 2 + 10

  let qi = 0
  let score = 0
  let consecutive = 0

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 1 + consecutive * 2
      consecutive++
      if (ti === 0 || t[ti - 1] === " ") score += 3
      qi++
    } else {
      consecutive = 0
    }
  }

  if (qi < q.length) return 0
  return score
}

export function fuzzySearch<T>(
  query: string,
  items: T[],
  getFields: (item: T) => string[],
  limit?: number
): T[] {
  const q = query.trim()
  if (!q) return items

  return items
    .map((item) => ({
      item,
      score: Math.max(...getFields(item).map((field) => fuzzyScore(q, field))),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit ?? items.length)
    .map((s) => s.item)
}
