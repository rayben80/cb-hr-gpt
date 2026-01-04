// Date utilities using date-fns
// Common date formatting and calculation functions

import { format, formatDistance, parseISO, differenceInDays, differenceInMonths, differenceInYears, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

// Format date to Korean format
export const formatDate = (date: string | Date, formatStr: string = 'yyyy년 MM월 dd일'): string => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, formatStr, { locale: ko });
};

// Format date to short format (e.g., "2024-01-15")
export const formatDateShort = (date: string | Date): string => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
};

// Get relative time (e.g., "3일 전", "2시간 전")
export const getRelativeTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return formatDistance(d, new Date(), { addSuffix: true, locale: ko });
};

// Calculate service duration (years, months, days)
export const calculateDuration = (startDate: string | Date, endDate: string | Date = new Date()): string => {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) return '';

    const years = differenceInYears(end, start);
    const months = differenceInMonths(end, start) % 12;
    const days = differenceInDays(end, start) % 30;

    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    if (days > 0 && years === 0) parts.push(`${days}일`);

    return parts.length > 0 ? parts.join(' ') : '1일 미만';
};

// Re-export commonly used functions
export { parseISO, isValid, format, differenceInDays };
