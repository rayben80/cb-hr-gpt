// Utility for combining class names with Tailwind CSS
// Combines clsx and tailwind-merge for optimal class handling

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names and resolves Tailwind CSS conflicts
 * Usage: cn('px-2 py-1', condition && 'bg-blue-500', 'px-4') => 'py-1 bg-blue-500 px-4'
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Re-export for individual use if needed
export { clsx, twMerge };
