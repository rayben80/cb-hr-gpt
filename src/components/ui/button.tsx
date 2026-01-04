import { CircleNotch } from '@phosphor-icons/react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/* Toss Style Button:
   - Flatter, higher saturation
   - rounded-2xl or rounded-xl (Toss uses very round buttons)
   - No subtle standard shadows, but maybe large diffuse shadows for floating actions
   - Font weight semi-bold usually
*/
const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-0',
                primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-0',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                soft: 'bg-primary/10 text-primary hover:bg-primary/20',
            },
            size: {
                default: 'h-11 px-5 py-2.5 text-base', // Toss buttons are slightly chunkier
                sm: 'h-9 rounded-lg px-3 text-sm',
                lg: 'h-14 rounded-2xl px-8 text-lg',
                icon: 'h-11 w-11',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                disabled={isLoading || props.disabled}
                ref={ref}
                {...props}
            >
                {isLoading && <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="bold" />}
                {children}
            </Comp>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
