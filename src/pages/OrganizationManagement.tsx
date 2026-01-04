import { BulkSelectionProvider } from '@/contexts/BulkSelectionContext'; // Add import if not present (I need to check imports)
import { useOrganizationLogic } from '@/hooks/organization/useOrganizationLogic';
import { OrganizationViews } from '@/pages/organization/OrganizationViews';
import { memo } from 'react';

const OrganizationManagement = memo(() => {
    const viewProps = useOrganizationLogic();

    return (
        <BulkSelectionProvider value={viewProps.bulkSelection}>
            <OrganizationViews {...viewProps} />
        </BulkSelectionProvider>
    );
});

OrganizationManagement.displayName = 'OrganizationManagement';
export default OrganizationManagement;
