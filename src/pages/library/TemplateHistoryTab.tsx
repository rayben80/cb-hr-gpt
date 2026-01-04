import { memo } from 'react';

interface VersionHistoryItem {
    version: number;
    savedAt: string;
    savedBy: string;
    changeNote?: string;
}

interface TemplateHistoryTabProps {
    versionHistory: VersionHistoryItem[];
    templateId: string | number;
    onRestoreVersion?: ((templateId: string | number, version: number) => void) | undefined;
}

export const TemplateHistoryTab = memo(({ versionHistory, templateId, onRestoreVersion }: TemplateHistoryTabProps) => {
    return (
        <div className="space-y-3">
            {versionHistory
                .slice()
                .reverse()
                .map((history) => (
                    <VersionHistoryRow
                        key={history.version}
                        history={history}
                        templateId={templateId}
                        onRestoreVersion={onRestoreVersion}
                    />
                ))}
        </div>
    );
});

TemplateHistoryTab.displayName = 'TemplateHistoryTab';

interface VersionHistoryRowProps {
    history: VersionHistoryItem;
    templateId: string | number;
    onRestoreVersion?: ((templateId: string | number, version: number) => void) | undefined;
}

const VersionHistoryRow = memo(({ history, templateId, onRestoreVersion }: VersionHistoryRowProps) => {
    return (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4">
            <div>
                <p className="text-sm font-medium text-slate-800">v{history.version}</p>
                <p className="text-xs text-slate-500 mt-1">
                    {history.savedAt} · {history.savedBy}
                    {history.changeNote && ` · ${history.changeNote}`}
                </p>
            </div>
            {onRestoreVersion && (
                <button
                    onClick={() => onRestoreVersion(templateId, history.version)}
                    className="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                    복원
                </button>
            )}
        </div>
    );
});

VersionHistoryRow.displayName = 'VersionHistoryRow';
