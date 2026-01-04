import { Eye } from '@phosphor-icons/react';
import { memo } from 'react';
import { WordCloud } from '../../../components/dashboard/WordCloud';

interface FeedbackSidePanelProps {
    wordCloudData: { text: string; value: number }[];
    feedbackList: React.ReactNode;
}

export const FeedbackSidePanel = memo<FeedbackSidePanelProps>(({ wordCloudData, feedbackList }) => (
    <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" weight="regular" />
                피드백 키워드
            </h2>
            <WordCloud keywords={wordCloudData} />
            <p className="text-center text-xs text-slate-400 mt-2">동료 피드백에서 자주 언급된 단어입니다.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">동료 피드백 상세</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">{feedbackList}</div>
        </div>
    </div>
));
FeedbackSidePanel.displayName = 'FeedbackSidePanel';
