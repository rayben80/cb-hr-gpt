import { memo, ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    className?: string;
}

/**
 * Standardized Tooltip component using Radix UI
 * 
 * @example
 * <Tooltip content="This is a tooltip">
 *   <Button>Hover me</Button>
 * </Tooltip>
 */
export const Tooltip = memo(({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 200,
    className = '',
}: TooltipProps) => {
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        align={align}
                        sideOffset={5}
                        className={`
                            z-50 overflow-hidden rounded-lg
                            bg-slate-900 dark:bg-slate-100
                            px-3 py-1.5 text-sm
                            text-slate-50 dark:text-slate-900
                            shadow-lg
                            animate-in fade-in-0 zoom-in-95
                            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                            data-[side=bottom]:slide-in-from-top-2
                            data-[side=left]:slide-in-from-right-2
                            data-[side=right]:slide-in-from-left-2
                            data-[side=top]:slide-in-from-bottom-2
                            ${className}
                        `.trim()}
                    >
                        {content}
                        <TooltipPrimitive.Arrow
                            className="fill-slate-900 dark:fill-slate-100"
                        />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
});

Tooltip.displayName = 'Tooltip';
