/**
 * Canonical Satta Matka Patti (Pana) Generator & Validator
 *
 * Implements authoritative mathematical derivations for all 220 Patti in Satta Matka:
 * - Single Patti: 120 combinations (12 per digit, 3 distinct digits, sum % 10 == digit)
 * - Double Patti: 90 combinations (9 per digit, exactly 2 identical digits, sum % 10 == digit)
 * - Triple Patti: 10 combinations (1 per digit, 3 identical digits, sum % 10 == digit)
 *
 * Digit Sorting Order: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
 * In traditional Matka, 0 is treated as 10 for ordering purposes (comes after 9).
 * E.g., digits {1, 2, 0} sort as '120'; {3, 0, 0} sort as '300'; {0, 0, 0} sort as '000'.
 * All Patti are strictly formatted as 3-character strings preserving leading/trailing zeroes.
 */

export type PattiCategory = 'single' | 'double' | 'triple';

// Canonical cyclic digit ordering in Satta Matka (0 is ordered as 10)
export const MATKA_DIGIT_ORDER: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;

export interface PattiEntry {
  patti: string;
  category: PattiCategory;
  digit: number; // Sum modulo 10
  digits: [number, number, number];
}

/**
 * Calculates the digit sum modulo 10 for any 3-character Patti string.
 */
export function calculatePattiSum(patti: string): number {
  if (!patti || patti.length !== 3) {
    throw new Error(`Invalid Patti '${patti}': must be exactly 3 digits`);
  }
  const d1 = parseInt(patti[0], 10);
  const d2 = parseInt(patti[1], 10);
  const d3 = parseInt(patti[2], 10);
  if (isNaN(d1) || isNaN(d2) || isNaN(d3)) {
    throw new Error(`Invalid Patti '${patti}': contains non-numeric characters`);
  }
  return (d1 + d2 + d3) % 10;
}

/**
 * Classifies a 3-character Patti string into its category: 'single', 'double', 'triple', or 'invalid'.
 */
export function classifyPattiCategory(patti: string): PattiCategory | 'invalid' {
  if (!patti || patti.length !== 3 || !/^\d{3}$/.test(patti)) {
    return 'invalid';
  }
  const [d1, d2, d3] = [patti[0], patti[1], patti[2]];
  if (d1 === d2 && d2 === d3) {
    return 'triple';
  }
  if (d1 === d2 || d2 === d3 || d1 === d3) {
    return 'double';
  }
  return 'single';
}

/**
 * Pre-computed and memoized table of all 220 Patti grouped by digit (0-9) and category.
 */
class PattiCatalog {
  private static instance: PattiCatalog;

  public readonly byDigit: Record<
    number,
    { single: string[]; double: string[]; triple: string[]; all: string[] }
  >;
  public readonly all220: PattiEntry[];
  public readonly pattiLookup: Map<string, PattiEntry>;

  private constructor() {
    this.byDigit = {};
    for (let d = 0; d <= 9; d++) {
      this.byDigit[d] = { single: [], double: [], triple: [], all: [] };
    }
    this.all220 = [];
    this.pattiLookup = new Map();

    const order = MATKA_DIGIT_ORDER;

    // Generate all 3-digit combinations with d1 <= d2 <= d3 in Matka order
    for (let i = 0; i < 10; i++) {
      for (let j = i; j < 10; j++) {
        for (let k = j; k < 10; k++) {
          const d1 = order[i];
          const d2 = order[j];
          const d3 = order[k];
          const sum = (d1 + d2 + d3) % 10;
          const pattiStr = `${d1}${d2}${d3}`;

          let category: PattiCategory;
          if (d1 === d2 && d2 === d3) {
            category = 'triple';
          } else if (d1 === d2 || d2 === d3 || d1 === d3) {
            category = 'double';
          } else {
            category = 'single';
          }

          const entry: PattiEntry = {
            patti: pattiStr,
            category,
            digit: sum,
            digits: [d1, d2, d3]
          };

          this.byDigit[sum][category].push(pattiStr);
          this.byDigit[sum].all.push(pattiStr);
          this.all220.push(entry);
          this.pattiLookup.set(pattiStr, entry);
        }
      }
    }
  }

  public static getInstance(): PattiCatalog {
    if (!PattiCatalog.instance) {
      PattiCatalog.instance = new PattiCatalog();
    }
    return PattiCatalog.instance;
  }
}

/**
 * Returns all valid Patti possibilities for a given digit (0-9) and category ('single', 'double', 'triple').
 *
 * Single Patti: 12 combinations
 * Double Patti: 9 combinations
 * Triple Patti: 1 combination
 */
export function getPattiPossibilities(digit: number, category: PattiCategory): string[] {
  if (digit < 0 || digit > 9 || !Number.isInteger(digit)) {
    throw new Error(`Invalid digit ${digit}: must be an integer between 0 and 9`);
  }
  const catalog = PattiCatalog.getInstance();
  return [...catalog.byDigit[digit][category]];
}

/**
 * Returns all Patti combinations for a given digit across all 3 categories.
 */
export function getAllPattiForDigit(digit: number): {
  digit: number;
  single: string[];
  double: string[];
  triple: string[];
  total: number;
} {
  if (digit < 0 || digit > 9 || !Number.isInteger(digit)) {
    throw new Error(`Invalid digit ${digit}: must be an integer between 0 and 9`);
  }
  const catalog = PattiCatalog.getInstance();
  const d = catalog.byDigit[digit];
  return {
    digit,
    single: [...d.single],
    double: [...d.double],
    triple: [...d.triple],
    total: d.single.length + d.double.length + d.triple.length // 12 + 9 + 1 = 22
  };
}

/**
 * Validates a given Patti number against the target digit and category.
 */
export function validatePatti(
  patti: string,
  targetDigit: number,
  expectedCategory: PattiCategory
): { valid: boolean; reason?: string } {
  if (!patti || typeof patti !== 'string') {
    return { valid: false, reason: 'Patti number must be a non-empty string' };
  }
  if (!/^\d{3}$/.test(patti)) {
    return { valid: false, reason: `Patti '${patti}' must be exactly 3 numeric digits` };
  }
  if (targetDigit < 0 || targetDigit > 9 || !Number.isInteger(targetDigit)) {
    return { valid: false, reason: `Target digit ${targetDigit} must be an integer from 0 to 9` };
  }

  const catalog = PattiCatalog.getInstance();
  const entry = catalog.pattiLookup.get(patti);

  if (!entry) {
    // If digits are valid but not in canonical sorted order, check if valid permutation
    const sum = calculatePattiSum(patti);
    const cat = classifyPattiCategory(patti);
    if (sum !== targetDigit) {
      return {
        valid: false,
        reason: `Patti '${patti}' sum (${sum}) does not match target digit (${targetDigit})`
      };
    }
    if (cat !== expectedCategory) {
      return {
        valid: false,
        reason: `Patti '${patti}' is a ${cat} patti, expected ${expectedCategory} patti`
      };
    }
    return { valid: true };
  }

  if (entry.digit !== targetDigit) {
    return {
      valid: false,
      reason: `Patti '${patti}' sum (${entry.digit}) does not match target digit (${targetDigit})`
    };
  }

  if (entry.category !== expectedCategory) {
    return {
      valid: false,
      reason: `Patti '${patti}' is classified as ${entry.category}, not ${expectedCategory}`
    };
  }

  return { valid: true };
}

/**
 * Validates whole-number Points within an allowed range (default 1 to 10 or custom max).
 */
export function validatePoints(points: number, min: number = 1, max: number = 1000): {
  valid: boolean;
  value: number;
  reason?: string;
} {
  if (typeof points !== 'number' || isNaN(points)) {
    return { valid: false, value: 0, reason: 'Points must be a valid number' };
  }
  if (!Number.isInteger(points)) {
    return { valid: false, value: 0, reason: 'Points must be a whole integer' };
  }
  if (points < min) {
    return { valid: false, value: points, reason: `Points must be at least ${min}` };
  }
  if (points > max) {
    return { valid: false, value: points, reason: `Points cannot exceed ${max}` };
  }
  return { valid: true, value: points };
}

/**
 * Returns complete catalog of all 220 Patti.
 */
export function getAll220Patti(): PattiEntry[] {
  return [...PattiCatalog.getInstance().all220];
}
