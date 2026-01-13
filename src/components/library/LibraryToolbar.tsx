import { memo, useState } from 'react';
import { CategoryManagementModal } from '../../features/settings/CategoryManagementModal';
import {
    SortField,
    UnifiedLibraryToolbar,
    UnifiedLibraryToolbarProps,
    ViewMode,
} from './toolbar/UnifiedLibraryToolbar';

// Re-export types for compatibility if needed elsewhere
export type { SortField, ViewMode };

// Omit onManageCategories from the public props as it's handled internally
type LibraryToolbarPublicProps = Omit<UnifiedLibraryToolbarProps, 'onManageCategories'>;

export const LibraryToolbar = memo((props: LibraryToolbarPublicProps) => {
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    return (
        <>
            <UnifiedLibraryToolbar {...props} onManageCategories={() => setShowCategoryModal(true)} />
            <CategoryManagementModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
        </>
    );
});

LibraryToolbar.displayName = 'LibraryToolbar';
