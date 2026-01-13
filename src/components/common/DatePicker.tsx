import { ko } from 'date-fns/locale';
import React from 'react';
import ReactDatePicker, { DatePickerProps as RDPProps, registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register locale once
registerLocale('ko', ko);

interface DatePickerProps extends Omit<
    RDPProps,
    'onChange' | 'selectsMultiple' | 'selectsRange' | 'minDate' | 'maxDate'
> {
    onChange: (date: Date | null) => void;
    className?: string;
    wrapperClassName?: string;
    minDate?: Date | null | undefined;
    maxDate?: Date | null | undefined;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    className,
    wrapperClassName,
    dateFormat = 'yyyy-MM-dd',
    placeholderText = 'YYYY-MM-DD',
    onChange,
    minDate,
    maxDate,
    ...props
}) => {
    // Default styling (can be overridden via className)
    const defaultClassName =
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-slate-300';

    return (
        <ReactDatePicker
            {...props}
            onChange={(date: Date | null | any) => {
                if (!Array.isArray(date)) {
                    onChange(date as Date | null);
                }
            }}
            {...(minDate && { minDate })}
            {...(maxDate && { maxDate })}
            locale="ko"
            dateFormat={dateFormat}
            placeholderText={placeholderText}
            className={`${defaultClassName} ${className || ''}`}
            wrapperClassName={`w-full ${wrapperClassName || ''}`}
        />
    );
};
