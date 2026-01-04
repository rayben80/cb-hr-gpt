import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleItemClick = (childOnClick?: () => void) => {
        if (childOnClick) childOnClick();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className="cursor-pointer"
            >
                {trigger}
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="group" aria-label="메뉴 옵션">
                        {React.Children.map(children, (child) =>
                            React.isValidElement(child)
                                ? React.cloneElement(child, {
                                      onClick: () => handleItemClick((child.props as { onClick?: () => void }).onClick),
                                  } as React.Attributes)
                                : null
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface DropdownItemProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    disabledTooltip?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
    children,
    onClick,
    className = '',
    disabled = false,
    disabledTooltip = '',
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!disabled && onClick) {
            onClick();
        }
    };

    const finalClassName = `flex items-center px-4 py-2 text-sm w-full text-left transition-colors ${
        disabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground hover:bg-primary/5 hover:text-primary'
    } ${className}`;

    return (
        <button
            onClick={handleClick}
            className={finalClassName}
            disabled={disabled}
            title={disabled ? disabledTooltip : undefined}
        >
            {children}
        </button>
    );
};
