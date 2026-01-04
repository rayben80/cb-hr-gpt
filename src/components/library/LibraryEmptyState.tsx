import { Button } from '@/components/ui/button';
import { FileText, Plus } from '@phosphor-icons/react';
import { memo } from 'react';

interface LibraryEmptyStateProps {
    searchTerm: string;
    typeFilter: string;
    categoryFilter: string;
    showArchived: boolean;
    onCreateTemplate: () => void;
}

export const LibraryEmptyState = memo(
    ({ searchTerm, typeFilter, categoryFilter, showArchived, onCreateTemplate }: LibraryEmptyStateProps) => {
        const hasFilters = searchTerm.trim() || typeFilter !== '전체' || categoryFilter !== '전체';

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

                {/* Action Button */}
                {!hasFilters && !showArchived && (
                    <Button onClick={onCreateTemplate} variant="default">
                        <Plus className="w-5 h-5 mr-2" weight="bold" />
                        템플릿 생성
                    </Button>
                )}
            </div>
        );
    }
);

LibraryEmptyState.displayName = 'LibraryEmptyState';
