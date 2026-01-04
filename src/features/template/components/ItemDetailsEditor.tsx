import React, { memo } from 'react';
import { InputField } from '../../../components/common';
import { SettingsCard } from '../../../components/settings/SettingsCard';
import { EvaluationItem } from '../../../constants';

interface ItemDetailsEditorProps {
    editedItem: EvaluationItem;
    onDetailChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ItemDetailsEditor = memo(({ editedItem, onDetailChange }: ItemDetailsEditorProps) => {
    if (editedItem.type === '정량') {
        return (
            <SettingsCard title="정량 지표 설정" description="측정 가능한 목표를 설정합니다.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="측정 지표"
                        id="metric"
                        name="metric"
                        type="text"
                        value={editedItem.details.metric || ''}
                        onChange={onDetailChange}
                        placeholder="예: 신규 계약 건수"
                    />
                    <InputField
                        label="목표"
                        id="target"
                        name="target"
                        type="text"
                        value={editedItem.details.target || ''}
                        onChange={onDetailChange}
                        placeholder="예: 30 건"
                    />
                </div>
                <div className="mt-4">
                    <InputField
                        label="성과 산식"
                        id="calculation"
                        name="calculation"
                        type="text"
                        value={editedItem.details.calculation || ''}
                        onChange={onDetailChange}
                        placeholder="예: 달성치 / 목표치 * 100%"
                    />
                </div>
            </SettingsCard>
        );
    }

    return (
        <SettingsCard title="정성 목표 설정" description="달성해야 할 목표를 구체적으로 서술합니다.">
            <InputField
                label="목표 설명"
                as="textarea"
                id="description"
                name="description"
                type="text"
                value={editedItem.details.description || ''}
                onChange={onDetailChange}
                placeholder="달성해야 할 목표를 구체적으로 서술합니다."
            />
        </SettingsCard>
    );
});

ItemDetailsEditor.displayName = 'ItemDetailsEditor';
