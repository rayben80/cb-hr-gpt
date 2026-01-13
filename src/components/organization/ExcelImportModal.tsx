import { DownloadSimple, FileArrowUp, Info, X } from '@phosphor-icons/react';
import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common';

interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
    onDownloadTemplate: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
    isOpen,
    onClose,
    onImport,
    onDownloadTemplate,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImport(e.target.files[0]);
            // Reset input value to allow selecting same file again
            e.target.value = '';
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-black bg-opacity-30"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>

                <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileArrowUp className="w-5 h-5 text-primary" weight="bold" />
                            엑셀 일괄 등록 가이드
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" weight="bold" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" weight="fill" />
                                <div>
                                    <p className="font-semibold mb-1">파일명 규칙</p>
                                    <p>파일명은 자유롭게 지정할 수 있습니다. (예: 2024년_상반기_조직도.xlsx)</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600 border rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">작성 시 주의사항</h4>
                                <ul className="list-disc list-inside space-y-1 ml-1">
                                    <li>
                                        <span className="font-medium text-gray-900">필수 항목</span>: 팀, 이름, 이메일
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-900">이메일</span>: 고유값이며, 기존
                                        이메일은 수정으로 처리됩니다. (파일 내 중복 불가)
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-900">고용형태</span>: '정규직' 또는
                                        '인턴' (미입력 시 정규직)
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-900">상태</span>: '재직', '휴직', '퇴사'
                                        중 선택
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-900">직책</span>: 팀장/파트장/팀원 중
                                        하나 (팀장 입력 시 리더로 자동 지정, 팀장은 파트를 비워주세요)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-between items-center bg-muted/30">
                        <Button
                            variant="outline"
                            onClick={onDownloadTemplate}
                            className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <DownloadSimple className="w-4 h-4" />
                            양식 다운로드
                        </Button>

                        <div className="flex w-full sm:w-auto gap-3">
                            <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
                                취소
                            </Button>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90"
                            >
                                <FileArrowUp className="w-4 h-4" weight="bold" />
                                파일 선택
                            </Button>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        className="hidden"
                        title="엑셀 파일 업로드"
                        aria-label="엑셀 파일 업로드"
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};
