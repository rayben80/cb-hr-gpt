import React, { useState, useEffect, useRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { ICONS } from '../constants';

interface IconProps {
    path: string;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ path, className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

interface InputFieldProps {
    label?: string;
    id: string;
    name?: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    as?: 'input' | 'textarea';
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, type, value, onChange, placeholder, as = 'input', name }) => {
    const commonProps = {
        id,
        value,
        onChange,
        placeholder,
        name: name || id,
        className: "block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm",
    };

    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
            {as === 'textarea' ? (
                <textarea {...commonProps as TextareaHTMLAttributes<HTMLTextAreaElement>} rows={3}></textarea>
            ) : (
                <input type={type} {...commonProps as InputHTMLAttributes<HTMLInputElement>} />
            )}
        </div>
    );
};

interface CheckboxProps {
    checked: boolean;
    indeterminate: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, indeterminate, onChange }) => {
    const ref = React.useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate && !checked;
        }
    }, [checked, indeterminate]);

    return (
        <div className="relative flex items-center">
            <input
                type="checkbox"
                ref={ref}
                checked={checked}
                onChange={onChange}
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            {indeterminate && !checked && (
                <Icon path={ICONS.minus} className="w-4 h-4 text-sky-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            )}
        </div>
    );
};

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
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleItemClick = (childOnClick?: () => void) => {
        if(childOnClick) childOnClick();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={(e) => {
                e.stopPropagation();
                setIsOpen(prev => !prev);
            }} className="cursor-pointer">
                {trigger}
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {React.Children.map(children, child =>
                           (React.isValidElement(child))
                           ? React.cloneElement(child, {
                                onClick: () => handleItemClick((child.props as { onClick?: () => void }).onClick)
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

export const DropdownItem: React.FC<DropdownItemProps> = ({ children, onClick, className = '', disabled = false, disabledTooltip = '' }) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!disabled && onClick) {
            onClick();
        }
    };

    const finalClassName = `flex items-center px-4 py-2 text-sm w-full text-left ${
        disabled
        ? 'text-slate-400 cursor-not-allowed'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    } ${className}`;

    return (
        <button
            onClick={handleClick}
            className={finalClassName}
            role="menuitem"
            disabled={disabled}
            title={disabled ? disabledTooltip : undefined}
        >
            {children}
        </button>
    );
};