import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes properly (resolving layout/spacing conflicts)
 * This acts exactly like the shadcn `cn` utility.
 * 
 * @param  {...any} inputs - List of class strings to merge.
 * @returns {string} - Merged and safely resolved Tailwind class list.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
