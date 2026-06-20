import { clsx } from "clsx";
import { tragedies, twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes with clsx and tailwind-merge.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
