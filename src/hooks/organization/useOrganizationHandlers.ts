import { useCallback, useMemo } from 'react';
import * as excelUtils from '../../utils/excelUtils';
import {
    createBulkDeleteHandler,
    createBulkMoveHandler,
    createExportHandler,
    createImportHandler,
    createMoveMemberHandler,
    createReorderMemberHandler,
    createReorderMemberToEndHandler,
} from './organizationLogicHelpers';

interface OrganizationHandlersProps {
    teams: any[];
    firestoreActions: any;
    showSuccess: (msg: string) => void;
    showError: (msg: string) => void;
    bulkSelection: any;
}

export function useOrganizationHandlers({
    teams,
    firestoreActions,
    showSuccess,
    showError,
    bulkSelection,
}: OrganizationHandlersProps) {
    const handleBulkDelete = useMemo(
        () => createBulkDeleteHandler({ bulkSelection, teams, firestoreActions, showSuccess }),
        [bulkSelection, teams, firestoreActions, showSuccess]
    );

    const handleBulkMove = useMemo(
        () => createBulkMoveHandler({ bulkSelection, teams, firestoreActions, showSuccess }),
        [bulkSelection, teams, firestoreActions, showSuccess]
    );

    const handleReorderMember = useMemo(
        () => createReorderMemberHandler(teams, firestoreActions),
        [teams, firestoreActions]
    );

    const handleReorderMemberToEnd = useMemo(
        () => createReorderMemberToEndHandler(teams, firestoreActions),
        [teams, firestoreActions]
    );

    const handleMoveMemberDrag = useMemo(
        () => createMoveMemberHandler(teams, firestoreActions, showSuccess),
        [teams, firestoreActions, showSuccess]
    );

    const handleImportExcel = useMemo(
        () => createImportHandler(teams, firestoreActions, showSuccess, showError),
        [teams, firestoreActions, showSuccess, showError]
    );

    const handleExportExcel = useMemo(
        () => createExportHandler(teams, showSuccess, showError),
        [teams, showSuccess, showError]
    );

    const handleDownloadTemplate = useCallback(() => excelUtils.downloadExcelTemplate(), []);

    return {
        handleBulkDelete,
        handleBulkMove,
        handleReorderMember,
        handleReorderMemberToEnd,
        handleMoveMemberDrag,
        handleImportExcel,
        handleExportExcel,
        handleDownloadTemplate,
    };
}
