import { Checkbox as UiCheckbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Minus } from '@phosphor-icons/react';
import React, { useEffect } from 'react';

interface CheckboxProps {
    checked: boolean;
    indeterminate: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    'aria-label'?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    indeterminate,
    onChange,
    disabled = false,
    'aria-label': ariaLabel,
}) => {
    // Since our new UiCheckbox is a controlled component wrapping an input,
    // we can pass onChange directly if we adapt the event if necessary.
    // However, Shadcn usually uses onCheckedChange (boolean).
    // But my "Dependency-lite" implementation was a direct input wrapper, strictly following HTML input API.

    // Direct input wrapper means it accepts `onChange` (React.ChangeEvent).

    const ref = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate && !checked;
        }
    }, [checked, indeterminate]);

    return (
        <div className="relative flex items-center">
            <UiCheckbox
                ref={ref}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                aria-label={ariaLabel || '선택'}
                className={cn(indeterminate && 'text-primary')} // Styling for indeterminate state if needed
            />
            {indeterminate && !checked && (
                <Minus
                    className="w-3 h-3 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    weight="bold"
                />
            )}
        </div>
    );
};
