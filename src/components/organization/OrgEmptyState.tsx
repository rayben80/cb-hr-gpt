import { Plus, Users } from '@phosphor-icons/react';
import { memo } from 'react';
import { Button } from '../common';

interface OrgEmptyStateProps {
    searchTerm: string;
    onAddTeam: () => void;
}

export const OrgEmptyState = memo(({ searchTerm, onAddTeam }: OrgEmptyStateProps) => (
    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-700 dark:to-slate-800 p-6 rounded-full mb-6 shadow-inner">
            <Users className="h-12 w-12 text-primary/50 dark:text-slate-500" weight="regular" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {searchTerm ? '검색 결과가 없습니다' : '아직 등록된 팀이 없습니다'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
            {searchTerm
                ? '검색어와 일치하는 팀이나 구성원을 찾을 수 없습니다.\n다른 검색어로 다시 시도해 보시거나 필터를 변경해 보세요.'
                : '새로운 팀을 추가하여 조직도를 구성해 보세요. 팀을 만들고 구성원을 배정하여 조직 관리를 시작할 수 있습니다.'}
        </p>
        {!searchTerm && (
            <Button
                onClick={onAddTeam}
                variant="primary"
                size="lg"
                className="gap-2 rounded-xl shadow-lg shadow-primary/20 dark:shadow-none hover:scale-105 active:scale-95"
            >
                <Plus className="w-5 h-5" weight="bold" />
                새로운 팀 만들기
            </Button>
        )}
    </div>
));

OrgEmptyState.displayName = 'OrgEmptyState';
