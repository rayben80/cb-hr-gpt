import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { InputField } from '../common';

interface HeadquarterFormData {
    name: string;
    leaderName: string;
    leaderRole: string;
    leaderEmail: string;
    leaderPhone: string;
}

interface HeadquarterFormFieldsProps {
    formData: HeadquarterFormData;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    error: string | null;
}

const formatPhoneNumber = (value: string) => {
    const clean = value.replace(/[^\d]/g, '');
    if (!clean) return '';

    if (clean.startsWith('02')) {
        if (clean.length <= 2) return clean;
        if (clean.length <= 5) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
        if (clean.length <= 9) return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
        return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}`;
    }

    if (clean.length <= 3) return clean;
    if (clean.length <= 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
};

export const HeadquarterFormFields: React.FC<HeadquarterFormFieldsProps> = ({ formData, onChange, error }) => {
    return (
        <div className="p-8 space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>
            )}
            <InputField
                label="본부명"
                id="hqName"
                name="name"
                type="text"
                value={formData.name ?? ''}
                onChange={onChange}
                placeholder="본부명을 입력하세요"
            />

            <div className="grid gap-4 md:grid-cols-2">
                <InputField
                    label="본부장 이름"
                    id="leaderName"
                    name="leaderName"
                    type="text"
                    value={formData.leaderName ?? ''}
                    onChange={onChange}
                    placeholder="예: 홍길동"
                />
                <InputField
                    label="본부장 직책"
                    id="leaderRole"
                    name="leaderRole"
                    type="text"
                    value={formData.leaderRole ?? ''}
                    onChange={onChange}
                    placeholder="예: 본부장"
                />
                <div className="space-y-2">
                    <Label htmlFor="leaderEmail">이메일 계정</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="leaderEmail"
                            name="leaderEmail"
                            value={(formData.leaderEmail ?? '').split('@')[0]}
                            onChange={(e) => {
                                const val = e.target.value.replace(/@.*/, ''); // ID only
                                onChange({
                                    target: {
                                        name: 'leaderEmail',
                                        value: val ? `${val}@forcs.com` : '',
                                    },
                                } as React.ChangeEvent<HTMLInputElement>);
                            }}
                            placeholder="ID 입력"
                            className="flex-1"
                        />
                        <div className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-md text-sm font-medium">
                            @forcs.com
                        </div>
                    </div>
                </div>
                <InputField
                    label="연락처"
                    id="leaderPhone"
                    name="leaderPhone"
                    type="tel"
                    value={formData.leaderPhone ?? ''}
                    onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        onChange({
                            target: {
                                name: 'leaderPhone',
                                value: formatted,
                            },
                        } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    placeholder="예: 010-1234-5678"
                    maxLength={13}
                />
            </div>
        </div>
    );
};
