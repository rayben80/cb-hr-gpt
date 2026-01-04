// Simple global state store using Zustand
// Use for UI state that needs to be shared across components

import { create } from 'zustand';

interface UIStore {
    // Sidebar state
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Modal state (generic)
    activeModal: string | null;
    openModal: (modalId: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    // Sidebar
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    // Modal
    activeModal: null,
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),
}));
