import React, { createContext, ReactNode, useContext } from 'react';

interface BulkSelectionContextType {
    selectedMemberIds: Set<string>;
    toggleSelection: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;
    isSelectionMode: boolean;
}

const BulkSelectionContext = createContext<BulkSelectionContextType | undefined>(undefined);

export const useBulkSelectionContext = () => {
    const context = useContext(BulkSelectionContext);
    if (!context) {
        throw new Error('useBulkSelectionContext must be used within a BulkSelectionProvider');
    }
    return context;
};

interface BulkSelectionProviderProps {
    children: ReactNode;
    value: {
        selectedMemberIds: Set<string>;
        toggleSelection: (id: string) => void;
        selectAll: (ids: string[]) => void;
        clearSelection: () => void;
    };
}

export const BulkSelectionProvider: React.FC<BulkSelectionProviderProps> = ({ children, value }) => {
    const isSelectionMode = value.selectedMemberIds.size > 0;

    return (
        <BulkSelectionContext.Provider value={{ ...value, isSelectionMode }}>{children}</BulkSelectionContext.Provider>
    );
};
