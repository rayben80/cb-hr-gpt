import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { EvaluationTemplate } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { db } from '../../firebaseConfig';

export const useFirestoreTemplates = () => {
    const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const { showError } = useError();

    useEffect(() => {
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
    }, [showError]);

    const addTemplate = async (template: Omit<EvaluationTemplate, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, 'templates'), template);
            return docRef.id;
        } catch (error) {
            console.error('Error adding template:', error);
            throw error;
        }
    };

    const updateTemplate = async (id: string, data: Partial<EvaluationTemplate>): Promise<void> => {
        try {
            const docRef = doc(db, 'templates', id);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    };

    const deleteTemplate = async (id: string): Promise<void> => {
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
