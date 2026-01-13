// Toast utilities using Sonner
// Simple toast notifications

import { toast, Toaster } from 'sonner';

// Toast helper functions with Korean messages
export const showSuccess = (message: string, description?: string) =>
    toast.success(message, description ? { description } : undefined);
export const showError = (message: string, description?: string) =>
    toast.error(message, description ? { description } : undefined);
export const showWarning = (message: string, description?: string) =>
    toast.warning(message, description ? { description } : undefined);
export const showInfo = (message: string, description?: string) =>
    toast.info(message, description ? { description } : undefined);

// Loading toast with promise
export const showLoading = <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
) => toast.promise(promise, messages);

// Export Toaster component for App.tsx
export { Toaster, toast };
