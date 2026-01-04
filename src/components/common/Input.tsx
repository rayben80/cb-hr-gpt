import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    label?: string;
    id: string;
    name?: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    as?: 'input' | 'textarea';
    error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    id,
    type,
    value,
    onChange,
    placeholder,
    as = 'input',
    name,
    disabled = false,
    onKeyDown,
    onBlur,
    error,
    autoFocus,
    className,
    ...props
}) => {
    const commonProps = {
        id,
        value,
        onChange,
        placeholder,
        name: name || id,
        onKeyDown,
        onBlur,
        disabled,
        autoFocus,
        className: cn(error && 'border-destructive focus-visible:ring-destructive', className),
        'aria-invalid': error ? ('true' as const) : undefined,
        'aria-describedby': error ? `${id}-error` : undefined,
        ...props,
    };

    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={id} className={cn(error && 'text-destructive')}>
                    {label}
                </Label>
            )}

            {as === 'textarea' ? (
                <Textarea {...(commonProps as TextareaHTMLAttributes<HTMLTextAreaElement>)} rows={3} />
            ) : (
                <Input type={type} {...(commonProps as InputHTMLAttributes<HTMLInputElement>)} />
            )}

            {error && (
                <p id={`${id}-error`} className="text-xs text-destructive font-medium flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
};
