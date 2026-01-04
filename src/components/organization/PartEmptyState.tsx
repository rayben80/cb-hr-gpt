import { UserPlus } from '@phosphor-icons/react';
import { memo } from 'react';

interface PartEmptyStateProps {
    searchTerm: string;
    onAddMember: () => void;
}

/**
 * 파트에 멤버가 없을 때 표시되는 빈 상태 컴포넌트
 */
export const PartEmptyState = memo(({ searchTerm, onAddMember }: PartEmptyStateProps) => (
    <div className="text-center p-3 sm:p-4 text-muted-foreground transition-all">
        {searchTerm ? (
            <p className="text-xs">검색 결과가 없습니다.</p>
        ) : (
            <>
                <p className="text-xs">
                    <span className="hidden sm:inline">이 파트에 멤버가 없습니다.</span>
                    <span className="sm:hidden">멤버 없음</span>
                </p>
                <button
                    type="button"
                    onClick={onAddMember}
                    className="mt-2 inline-flex items-center gap-1 rounded-full border border-dashed border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                    <UserPlus className="w-3.5 h-3.5" weight="regular" />
                    멤버 추가
                </button>
            </>
        )}
    </div>
));

PartEmptyState.displayName = 'PartEmptyState';
