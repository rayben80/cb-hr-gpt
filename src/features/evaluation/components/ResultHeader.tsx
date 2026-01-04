import { ArrowLeft, DownloadSimple } from '@phosphor-icons/react';
import { memo } from 'react';

interface ResultHeaderProps {
    evaluationName: string;
    subject: { name: string; role: string };
    period: string;
    onExport: () => void;
    isExporting: boolean;
    onBack: () => void;
}

export const ResultHeader = memo<ResultHeaderProps>(
    ({ evaluationName, subject, period, onExport, isExporting, onBack }) => (
        <div className="mb-8">
            <button
                onClick={onBack}
                className="flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" weight="regular" />
                평가 목록으로 돌아가기
            </button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{evaluationName} 결과</h1>
                    <p className="text-lg text-slate-600 mt-1">
                        {subject.name} ({subject.role})
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className="text-md text-slate-500 font-medium">평가 기간: {period}</span>
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadSimple className="w-5 h-5" weight="regular" />
                        {isExporting ? 'PDF 생성 중...' : 'PDF 내보내기'}
                    </button>
                </div>
            </div>
        </div>
    )
);
ResultHeader.displayName = 'ResultHeader';
