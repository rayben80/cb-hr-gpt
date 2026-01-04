const DEFAULT_STORAGE_WRITE_DEBOUNCE_MS = 300;
const rawDebounce = Number(import.meta.env?.VITE_STORAGE_WRITE_DEBOUNCE_MS);

export const STORAGE_WRITE_DEBOUNCE_MS =
    Number.isFinite(rawDebounce) && rawDebounce >= 0 ? rawDebounce : DEFAULT_STORAGE_WRITE_DEBOUNCE_MS;
