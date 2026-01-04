import { memo } from 'react';

interface OrganizationPageHeaderProps {
    subtitle?: string | undefined;
}

export const OrganizationPageHeader = memo(({ subtitle }: OrganizationPageHeaderProps) => {
    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">조직 관리</h1>
            <p className="text-lg text-slate-600 mt-1">{subtitle || '클라우드사업본부 조직도 및 인원 현황'}</p>
        </div>
    );
});

OrganizationPageHeader.displayName = 'OrganizationPageHeader';
