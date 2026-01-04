import React from 'react';
import { InputField } from '../common';
import { ModalActions } from '../common/Modal';
import { CloseButton } from '../common/index';

interface TeamFormData {
    name: string;
    lead: string;
}

interface LeaderOption {
    value: string;
    label: string;
}

interface TeamFormProps {
    formRef: React.RefObject<HTMLFormElement>;
    formData: TeamFormData;
    error: string | null;
    mode: 'add' | 'edit';
    leaderOptions: LeaderOption[];
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onCloseRequest: () => void;
    onSave: () => void;
    /** Hide header when used inside Modal component */
    hideHeader?: boolean;
    /** Hide footer when used inside Modal component */
    hideFooter?: boolean;
}

/**
 * 팀 추가/수정 폼 컴포넌트
 */
export const TeamForm: React.FC<TeamFormProps> = ({
    formRef,
    formData,
    error,
    mode,
    leaderOptions,
    onSubmit,
    onChange,
    onCloseRequest,
    onSave,
    hideHeader = false,
    hideFooter = false,
}) => {
    const title = mode === 'add' ? '새 팀 추가' : '팀 정보 수정';

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            {/* Header - conditionally hidden */}
            {!hideHeader && (
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <CloseButton onClick={onCloseRequest} />
                </div>
            )}

            {/* Content */}
            <div className={hideHeader ? 'space-y-6' : 'p-8 space-y-6'}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}
                <InputField
                    label="팀 이름"
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="팀 이름 입력"
                />
                {mode === 'edit' && (
                    <div>
                        <label htmlFor="lead" className="block text-sm font-medium text-slate-700 mb-1">
                            팀장
                        </label>
                        <select
                            id="lead"
                            name="lead"
                            value={formData.lead}
                            onChange={onChange}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            disabled={leaderOptions.length === 0}
                        >
                            <option value="">팀장 미지정</option>
                            {leaderOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {leaderOptions.length === 0 && (
                            <p className="text-xs text-slate-500 mt-2">팀 멤버가 없어 팀장을 지정할 수 없습니다.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - conditionally hidden */}
            {!hideFooter && (
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <ModalActions
                        onCancel={onCloseRequest}
                        onConfirm={onSave}
                        cancelText="취소"
                        confirmText={mode === 'add' ? '팀 추가' : '저장'}
                        confirmVariant="primary"
                        className="justify-end"
                    />
                </div>
            )}
        </form>
    );
};
