import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className = '',
    maxWidth = 'sm:max-w-lg',
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${maxWidth} ${className}`}>
                {(title || description) && (
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && <DialogDescription className="pt-2">{description}</DialogDescription>}
                    </DialogHeader>
                )}
                <div className="py-2">{children}</div>
                {footer && <DialogFooter className="mt-4 gap-2 sm:gap-0">{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
};

interface ModalActionsProps {
    onCancel?: () => void;
    onConfirm?: () => void;
    cancelText?: string;
    confirmText?: string;
    confirmVariant?: React.ComponentProps<typeof Button>['variant'];
    confirmDisabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const ModalActions: React.FC<ModalActionsProps> = ({
    children,
    onCancel,
    onConfirm,
    cancelText = '취소',
    confirmText = '확인',
    confirmVariant = 'primary',
    confirmDisabled,
    className = '',
}) => {
    return (
        <div className={`flex justify-end gap-2 mt-4 ${className}`}>
            {children || (
                <>
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel} type="button">
                            {cancelText}
                        </Button>
                    )}
                    {onConfirm && (
                        <Button variant={confirmVariant} onClick={onConfirm} type="submit" disabled={confirmDisabled}>
                            {confirmText}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
