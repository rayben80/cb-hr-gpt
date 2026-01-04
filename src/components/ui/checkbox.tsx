import { Check } from '@phosphor-icons/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Simulating Radix UI Checkbox with standard HTML input
const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <div className="relative inline-flex items-center justify-center w-4 h-4">
            <input
                type="checkbox"
                className={cn(
                    'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:text-primary-foreground',
                    className
                )}
                ref={ref}
                {...props}
            />
            <Check
                className="absolute w-3 h-3 text-primary-foreground pointer-events-none hidden peer-checked:block"
                weight="bold"
            />
        </div>
    )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
