// Toast utilities using Sonner
// Simple toast notifications

import { toast, Toaster } from 'sonner';

// Toast helper functions with Korean messages
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showWarning = (message: string) => toast.warning(message);
export const showInfo = (message: string) => toast.info(message);

// Loading toast with promise
export const showLoading = <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
) => toast.promise(promise, messages);

// Export Toaster component for App.tsx
export { Toaster, toast };
