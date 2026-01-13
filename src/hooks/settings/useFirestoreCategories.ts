import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../../firebase';

export interface Category {
    id: string;
    name: string;
    isDefault?: boolean;
    order: number;
}

interface CategoriesDocument {
    items: Category[];
    updatedAt: Timestamp;
}

type CategoryActionResult = { ok: true } | { ok: false; message: string };

// 기본 카테고리 목록
const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: '공통', isDefault: true, order: 0 },
    { id: '2', name: '직군별', isDefault: false, order: 1 },
    { id: '3', name: '팀별', isDefault: false, order: 2 },
    { id: '4', name: 'PM/PL', isDefault: false, order: 3 },
];

/**
 * Firestore 카테고리 CRUD 훅
 * /settings/categories 문서에서 카테고리 목록 관리
 * onSnapshot으로 실시간 업데이트 지원
 */
export function useFirestoreCategories() {
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 카테고리 문서 참조 (useMemo로 안정화)
    const categoriesDocRef = useMemo(() => doc(db, 'settings', 'categories'), []);

    // 실시간 구독 설정
    useEffect(() => {
        const isE2EMock = import.meta.env.VITE_E2E_MOCK_DATA === 'true';
        if (isE2EMock) {
            setCategories(DEFAULT_CATEGORIES);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(
            categoriesDocRef,
            async (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data() as CategoriesDocument;
                    setCategories(data.items.sort((a, b) => a.order - b.order));
                } else {
                    // 문서가 없으면 기본 카테고리로 초기화
                    await setDoc(categoriesDocRef, {
                        items: DEFAULT_CATEGORIES,
                        updatedAt: Timestamp.now(),
                    });
                    setCategories(DEFAULT_CATEGORIES);
                }
                setError(null);
                setLoading(false);
            },
            (err) => {
                console.error('카테고리 로드 오류:', err);
                setError('카테고리를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [categoriesDocRef]);

    // 카테고리 추가
    const addCategory = useCallback(
        async (name: string): Promise<CategoryActionResult> => {
            if (categories.some((cat) => cat.name === name)) {
                const message = '이미 존재하는 카테고리입니다.';
                setError(message);
                return { ok: false, message };
            }

            const newCategory: Category = {
                id: Date.now().toString(),
                name,
                isDefault: false,
                order: categories.length,
            };

            const updatedCategories = [...categories, newCategory];

            try {
                await setDoc(categoriesDocRef, {
                    items: updatedCategories,
                    updatedAt: Timestamp.now(),
                });
                setError(null);
                return { ok: true };
            } catch (err) {
                console.error('카테고리 추가 오류:', err);
                const message = '카테고리 추가에 실패했습니다.';
                setError(message);
                return { ok: false, message };
            }
        },
        [categories, categoriesDocRef]
    );

    // 카테고리 수정
    const updateCategory = useCallback(
        async (id: string, newName: string): Promise<CategoryActionResult> => {
            const updatedCategories = categories.map((cat) => (cat.id === id ? { ...cat, name: newName } : cat));

            try {
                await setDoc(categoriesDocRef, {
                    items: updatedCategories,
                    updatedAt: Timestamp.now(),
                });
                setError(null);
                return { ok: true };
            } catch (err) {
                console.error('카테고리 수정 오류:', err);
                const message = '카테고리 수정에 실패했습니다.';
                setError(message);
                return { ok: false, message };
            }
        },
        [categories, categoriesDocRef]
    );

    // 카테고리 삭제
    const deleteCategory = useCallback(
        async (id: string): Promise<CategoryActionResult> => {
            const categoryToDelete = categories.find((cat) => cat.id === id);
            if (categoryToDelete?.isDefault) {
                const message = '기본 카테고리는 삭제할 수 없습니다.';
                setError(message);
                return { ok: false, message };
            }

            const updatedCategories = categories
                .filter((cat) => cat.id !== id)
                .map((cat, index) => ({ ...cat, order: index }));

            try {
                await setDoc(categoriesDocRef, {
                    items: updatedCategories,
                    updatedAt: Timestamp.now(),
                });
                setError(null);
                return { ok: true };
            } catch (err) {
                console.error('카테고리 삭제 오류:', err);
                const message = '카테고리 삭제에 실패했습니다.';
                setError(message);
                return { ok: false, message };
            }
        },
        [categories, categoriesDocRef]
    );

    // 필터용 옵션 (전체 포함)
    const categoryOptions = useMemo(() => ['전체', ...categories.map((cat) => cat.name)], [categories]);

    // 에디터용 옵션 (전체 제외)
    const editorCategoryOptions = useMemo(() => categories.map((cat) => cat.name), [categories]);

    return {
        categories,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        categoryOptions,
        editorCategoryOptions,
    };
}
