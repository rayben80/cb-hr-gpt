import React from 'react';
import { Icon } from './common';
import { ICONS } from '../constants';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
    confirmButtonColor?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    title,
    message,
    confirmButtonText = '확인',
    confirmButtonColor = 'bg-red-600 hover:bg-red-700'
}) => {
    if (import.meta.env.DEV) {
        console.log('ConfirmationModal rendered with:', { isOpen, title, message });
    }
    
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (import.meta.env.DEV) {
            console.log('ConfirmationModal confirmed');
        }
        onConfirm();
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            if (import.meta.env.DEV) {
                console.log('ConfirmationModal backdrop clicked');
            }
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
            style={{ display: isOpen ? 'flex' : 'none' }}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <Icon path={ICONS.xMark} className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-slate-600 mb-8">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${confirmButtonColor}`}
                        >
                            {confirmButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
