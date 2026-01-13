import { Button } from '@/components/ui/button';
import { Database, FileText, Plus } from '@phosphor-icons/react';
import { memo, useState } from 'react';

interface LibraryEmptyStateProps {
    searchTerm: string;
    typeFilter: string;
    categoryFilter: string;
    showArchived: boolean;
    onCreateTemplate: () => void;
    onSeedMockData?: (() => Promise<void>) | undefined;
}

export const LibraryEmptyState = memo(
    ({
        searchTerm,
        typeFilter,
        categoryFilter,
        showArchived,
        onCreateTemplate,
        onSeedMockData,
    }: LibraryEmptyStateProps) => {
        const hasFilters = searchTerm.trim() || typeFilter !== '전체' || categoryFilter !== '전체';
        const [isSeeding, setIsSeeding] = useState(false);

        const handleSeed = async () => {
            if (!onSeedMockData) return;
            setIsSeeding(true);
            try {
                await onSeedMockData();
            } finally {
                setIsSeeding(false);
            }
        };

        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <FileText className="h-10 w-10 text-primary" weight="regular" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {hasFilters
                        ? '검색 결과가 없습니다'
                        : showArchived
                          ? '보관된 템플릿이 없습니다'
                          : '등록된 템플릿이 없습니다'}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                    {hasFilters
                        ? '다른 검색어나 필터를 시도해보세요.'
                        : '첫 번째 템플릿을 만들어 팀의 평가 프로세스를 시작하세요.'}
                </p>

                {/* Action Buttons */}
                {!hasFilters && !showArchived && (
                    <div className="flex gap-3">
                        <Button onClick={onCreateTemplate} variant="default">
                            <Plus className="w-5 h-5 mr-2" weight="bold" />새 템플릿 생성
                        </Button>
                        {onSeedMockData && (
                            <Button onClick={handleSeed} variant="outline" disabled={isSeeding}>
                                <Database className="w-5 h-5 mr-2" weight="regular" />
                                {isSeeding ? '추가 중...' : '샘플 데이터 추가'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

LibraryEmptyState.displayName = 'LibraryEmptyState';
