
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a random integer within a specified range
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random integer between min and max
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random ID suitable for Supabase int8 type
 * Returns a positive integer within the safe range for JavaScript numbers
 * and PostgreSQL's int8 type
 * @returns A random integer suitable for use as an ID
 */
export function generateSupabaseId(): number {
  // PostgreSQL int8 (bigint) can store values from -9223372036854775808 to 9223372036854775807
  // JavaScript can safely represent integers between -(2^53 - 1) and 2^53 - 1
  // We'll use a safe range that works for both: up to 9007199254740991 (Number.MAX_SAFE_INTEGER)
  return getRandomInt(1, Number.MAX_SAFE_INTEGER);
}
