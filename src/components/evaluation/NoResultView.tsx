import { memo } from 'react';
import { Button } from '../common';
import { StatusCard } from '../feedback/Status';

interface NoResultViewProps {
    onBack: () => void;
}

export const NoResultView = memo(({ onBack }: NoResultViewProps) => (
    <div className="bg-white p-8 rounded-xl shadow-sm">
        <StatusCard
            status="info"
            title="평가 결과가 아직 준비되지 않았습니다."
            description="평가가 완료된 후 결과 산출이 완료되면 확인할 수 있습니다."
            action={
                <Button variant="outline" onClick={onBack}>
                    목록으로 돌아가기
                </Button>
            }
        />
    </div>
));

NoResultView.displayName = 'NoResultView';
