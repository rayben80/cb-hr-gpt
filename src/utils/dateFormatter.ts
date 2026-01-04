export const calculateServiceDuration = (hireDateStr: string, baseDateStr: string): string => {
    if (!hireDateStr || !baseDateStr) return '';
    const hireDate = new Date(hireDateStr);
    const baseDate = new Date(baseDateStr);

    if (isNaN(hireDate.getTime()) || isNaN(baseDate.getTime()) || hireDate > baseDate) {
        return '';
    }

    const effectiveBaseDate = new Date(baseDate);
    effectiveBaseDate.setDate(effectiveBaseDate.getDate() + 1);

    let years = effectiveBaseDate.getFullYear() - hireDate.getFullYear();
    let months = effectiveBaseDate.getMonth() - hireDate.getMonth();
    let days = effectiveBaseDate.getDate() - hireDate.getDate();

    if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(effectiveBaseDate.getFullYear(), effectiveBaseDate.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    if (days > 0) parts.push(`${days}일`);

    if (parts.length === 0) {
        return '(1일)';
    }

    return `(${parts.join(' ')})`;
};
