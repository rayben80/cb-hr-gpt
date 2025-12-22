import { useEffect } from 'react';

export interface KeyboardNavigationConfig {
    isOpen: boolean;
    confirmationOpen: boolean;
    isTransitioning: boolean;
    currentStep: number;
    canProceedToStep2: boolean;
    canProceedToStep3: boolean;
    onCloseRequest: () => void;
    onPreviousStep: () => void;
    onNextStep: () => void;
    onSaveAndClose?: () => void;
}

export const useKeyboardNavigation = ({
    isOpen,
    confirmationOpen,
    isTransitioning,
    currentStep,
    canProceedToStep2,
    canProceedToStep3,
    onCloseRequest,
    onPreviousStep,
    onNextStep,
    onSaveAndClose
}: KeyboardNavigationConfig) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || confirmationOpen || isTransitioning) return;
            
            switch (e.key) {
                case 'Escape':
                    onCloseRequest();
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey && currentStep > 1) {
                        e.preventDefault();
                        onPreviousStep();
                    }
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey && currentStep < 4) {
                        e.preventDefault();
                        // 단계별 유효성 검사
                        if (currentStep === 1 && !canProceedToStep2) return;
                        if (currentStep === 2 && !canProceedToStep3) return;
                        onNextStep();
                    }
                    break;
                case 'Enter':
                    if (e.ctrlKey && currentStep === 4 && onSaveAndClose) {
                        e.preventDefault();
                        onSaveAndClose();
                    }
                    break;
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [
        isOpen, 
        confirmationOpen, 
        currentStep, 
        isTransitioning, 
        canProceedToStep2, 
        canProceedToStep3,
        onCloseRequest,
        onPreviousStep,
        onNextStep,
        onSaveAndClose
    ]);
};