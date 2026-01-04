import { ArrowDown, ArrowUp } from '@phosphor-icons/react';
import { memo } from 'react';

interface StrengthsWeaknessesProps {
    strengthsList: React.ReactNode;
    improvementsList: React.ReactNode;
}

export const StrengthsWeaknesses = memo<StrengthsWeaknessesProps>(({ strengthsList, improvementsList }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <ArrowUp className="w-5 h-5 mr-2 text-green-500" weight="regular" />
                주요 강점
            </h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600">{strengthsList}</ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <ArrowDown className="w-5 h-5 mr-2 text-red-500" weight="regular" />
                개선 제안
            </h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600">{improvementsList}</ul>
        </div>
    </div>
));
StrengthsWeaknesses.displayName = 'StrengthsWeaknesses';
