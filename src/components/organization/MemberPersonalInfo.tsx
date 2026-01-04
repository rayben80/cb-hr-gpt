import { parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import React from 'react';
import DatePicker from 'react-datepicker';
import { DEFAULT_MEMBER_ROLE, MEMBER_ROLE_OPTIONS } from '../../utils/memberRoleUtils';
import { InputField } from '../common';

interface MemberFormData {
    name: string;
    role: string;
    email: string;
    hireDate: string;
}

interface MemberPersonalInfoProps {
    formData: MemberFormData;
    displayEmail: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDateChange: (date: Date | null) => void;
}

export const MemberPersonalInfo: React.FC<MemberPersonalInfoProps> = ({
    formData,
    displayEmail,
    onChange,
    onEmailChange,
    onDateChange,
}) => {
    return (
        <>
            <InputField
                label="이름"
                id="name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={onChange}
                placeholder="이름 입력"
            />
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                    직책
                </label>
                <select
                    id="role"
                    name="role"
                    value={formData.role || DEFAULT_MEMBER_ROLE}
                    onChange={onChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    {MEMBER_ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    이메일
                </label>
                <div className="relative rounded-md shadow-sm">
                    <input
                        type="text"
                        name="email"
                        id="email"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-28"
                        value={displayEmail}
                        onChange={onEmailChange}
                        placeholder="이메일 아이디"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-slate-500 sm:text-sm">
                            {displayEmail.includes('@') ? '' : '@forcs.com'}
                        </span>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-slate-700 mb-1">
                    입사일
                </label>
                <DatePicker
                    id="hireDate"
                    selected={formData.hireDate ? parse(formData.hireDate, 'yyyy-MM-dd', new Date()) : null}
                    onChange={onDateChange}
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="YYYY-MM-DD"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    wrapperClassName="w-full"
                />
            </div>
        </>
    );
};
