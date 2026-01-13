import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { EvaluationTemplate } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { db } from '../../firebase';

export const useFirestoreTemplates = () => {
    const isE2EMock = import.meta.env.VITE_E2E_MOCK_DATA === 'true';
    const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
    const [loading, setLoading] = useState(!isE2EMock);
    const { showError } = useError();

    useEffect(() => {
        if (isE2EMock) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'templates'), orderBy('lastUpdated', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const loadedTemplates = snapshot.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        }) as EvaluationTemplate
                );
                setTemplates(loadedTemplates);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching templates:', error);
                showError('데이터 불러오기 실패', '템플릿 목록을 불러오는 중 오류가 발생했습니다.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [showError, isE2EMock]);

    const addTemplate = async (template: Omit<EvaluationTemplate, 'id'>): Promise<string> => {
        if (isE2EMock) {
            return `mock-template-${Date.now()}`;
        }
        try {
            const docRef = await addDoc(collection(db, 'templates'), template);
            return docRef.id;
        } catch (error) {
            console.error('Error adding template:', error);
            throw error;
        }
    };

    const updateTemplate = async (id: string, data: Partial<EvaluationTemplate>): Promise<void> => {
        if (isE2EMock) {
            setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
            return;
        }
        try {
            const docRef = doc(db, 'templates', id);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    };

    const deleteTemplate = async (id: string): Promise<void> => {
        if (isE2EMock) {
            setTemplates((prev) => prev.filter((t) => t.id !== id));
            return;
        }
        try {
            const docRef = doc(db, 'templates', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    };

    return {
        templates,
        loading,
        addTemplate,
        updateTemplate,
        deleteTemplate,
    };
};
