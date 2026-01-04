import { useState, useCallback } from 'react';

export interface FormActions<T> {
    updateField: (field: keyof T, value: any) => void;
    updateFields: (fields: Partial<T>) => void;
    resetForm: (initialValues?: T) => void;
    setFormData: (data: T) => void;
}

/**
 * Form 상태를 관리하는 범용적인 커스텀 훅
 * 중복되는 form 상태 관리 로직을 통합
 */
export const useFormState = <T extends Record<string, any>>(
    initialValues: T
): [T, FormActions<T>] => {
    const [formData, setFormData] = useState<T>(initialValues);

    const updateField = useCallback((field: keyof T, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const updateFields = useCallback((fields: Partial<T>) => {
        setFormData(prev => ({
            ...prev,
            ...fields
        }));
    }, []);

    const resetForm = useCallback((newInitialValues?: T) => {
        setFormData(newInitialValues || initialValues);
    }, [initialValues]);

    const setFormDataCallback = useCallback((data: T) => {
        setFormData(data);
    }, []);

    const actions: FormActions<T> = {
        updateField,
        updateFields,
        resetForm,
        setFormData: setFormDataCallback,
    };

    return [formData, actions];
};