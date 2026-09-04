const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
const MID = DIGITS[Math.floor(DIGITS.length / 2)]!;
const MAX_INDEX = DIGITS.length - 1;
const RANK_RE = /^[0-9a-z]+$/;

export function isValidPosition(value: string): boolean {
  return RANK_RE.test(value);
}

export function comparePositions(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function sortByPosition<T extends { position: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => comparePositions(a.position, b.position));
}

export function generateKeyBetween(
  prev: string | null | undefined,
  next: string | null | undefined,
): string {
  const a = prev ?? null;
  const b = next ?? null;

  if (a !== null && !isValidPosition(a)) {
    throw new Error(`Invalid rank: ${a}`);
  }
  if (b !== null && !isValidPosition(b)) {
    throw new Error(`Invalid rank: ${b}`);
  }
  if (a !== null && b !== null && a >= b) {
    throw new Error(`Invalid range: "${a}" >= "${b}"`);
  }

  if (a === null && b === null) return "a0";
  if (b === null) return incrementKey(a!);
  if (a === null) return decrementKey(b);
  return midpointKey(a, b);
}

export function generateNKeysBetween(
  prev: string | null | undefined,
  next: string | null | undefined,
  n: number,
): string[] {
  if (n <= 0) return [];
  if (n === 1) return [generateKeyBetween(prev, next)];

  const mid = generateKeyBetween(prev, next);
  const leftCount = Math.floor((n - 1) / 2);
  const rightCount = n - 1 - leftCount;
  return [
    ...generateNKeysBetween(prev, mid, leftCount),
    mid,
    ...generateNKeysBetween(mid, next, rightCount),
  ];
}

function digitIndex(ch: string): number {
  const index = DIGITS.indexOf(ch);
  if (index === -1) {
    throw new Error(`Invalid rank character: ${ch}`);
  }
  return index;
}

function incrementKey(key: string): string {
  const last = key[key.length - 1]!;
  const index = digitIndex(last);
  if (index < MAX_INDEX) {
    return key.slice(0, -1) + DIGITS[index + 1];
  }
  return key + MID;
}

function decrementKey(key: string): string {
  const first = key[0]!;
  const index = digitIndex(first);
  if (index > 0) {
    return DIGITS[index - 1]! + MID;
  }
  if (key.length > 1) {
    return key.slice(0, -1);
  }
  throw new Error("Cannot generate a key before the minimum rank");
}

function midpointKey(a: string, b: string): string {
  let prefix = "";
  for (let i = 0; i < Math.max(a.length, b.length) + 1; i++) {
    const aIndex = i < a.length ? digitIndex(a[i]!) : -1;
    const bIndex = i < b.length ? digitIndex(b[i]!) : DIGITS.length;
    const low = aIndex < 0 ? 0 : aIndex;

    if (bIndex - low > 1) {
      return prefix + DIGITS[Math.floor((low + bIndex) / 2)];
    }

    prefix += aIndex < 0 ? DIGITS[0] : a[i];
  }

  return prefix + MID;
}
