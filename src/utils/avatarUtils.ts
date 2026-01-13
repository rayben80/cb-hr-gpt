export const AVATAR_COLORS = [
    'F44336', // Red
    'E91E63', // Pink
    '9C27B0', // Purple
    '673AB7', // Deep Purple
    '3F51B5', // Indigo
    '2196F3', // Blue
    '03A9F4', // Light Blue
    '00BCD4', // Cyan
    '009688', // Teal
    '4CAF50', // Green
    '8BC34A', // Light Green
    'CDDC39', // Lime
    'FFEB3B', // Yellow
    'FFC107', // Amber
    'FF9800', // Orange
    'FF5722', // Deep Orange
    '795548', // Brown
    '607D8B', // Blue Grey
];

const normalizeAvatarKey = (value: string): string => value.replace(/\s+/g, '').toLowerCase();

export const getAvatarInitials = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return '?';
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        const first = Array.from(words[0])[0] || '';
        const second = Array.from(words[1])[0] || '';
        return `${first}${second}`.toUpperCase();
    }
    const chars = Array.from(trimmed);
    if (chars.length <= 2) return trimmed;
    return chars.slice(-2).join('');
};

export const getAvatarUrlWithKey = (name: string, key: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return '';

    const normalizedKey = normalizeAvatarKey(key);

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < normalizedKey.length; i++) {
        hash = normalizedKey.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Select color based on hash
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    const color = AVATAR_COLORS[index];

    const initials = getAvatarInitials(trimmed);
    const size = Array.from(initials).length > 1 ? 56 : 64;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" fill="#fff">${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Generates a consistent avatar URL based on the user's name.
 * Uses a simple hash to select a background color from a predefined palette.
 */
export const getAvatarUrl = (name: string): string => getAvatarUrlWithKey(name, name);

export const getDisplayAvatarUrl = (name: string, _avatar?: string | null, seed?: string | null): string => {
    const key = seed ?? name;
    return getAvatarUrlWithKey(name, key);
};
