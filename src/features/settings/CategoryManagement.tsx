import { Check, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react';
import { memo, useState } from 'react';
import { Button } from '../../components/common';
import { Category, useFirestoreCategories } from '../../hooks/settings/useFirestoreCategories';
import { showError, showSuccess } from '../../utils/toast';

/**
 * 카테고리 관리 컴포넌트
 * 카테고리 추가/수정/삭제 기능 제공
 */
interface CategoryRowProps {
    category: Category;
    editingId: string | null;
    editingName: string;
    deletingId: string | null;
    onEditStart: (category: Category) => void;
    onEditChange: (value: string) => void;
    onEditSave: () => void;
    onEditCancel: () => void;
    onDeleteConfirm: (id: string) => void;
    onDeleteCancel: () => void;
    onDelete: () => void;
}

const CategoryRow = memo(
    ({
        category,
        editingId,
        editingName,
        deletingId,
        onEditStart,
        onEditChange,
        onEditSave,
        onEditCancel,
        onDeleteConfirm,
        onDeleteCancel,
        onDelete,
    }: CategoryRowProps) => {
        const isEditing = editingId === category.id;
        const isDeleting = deletingId === category.id;

        return (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={editingName}
                            onChange={(e) => onEditChange(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            autoFocus
                            aria-label="카테고리 이름 수정"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onEditSave();
                                if (e.key === 'Escape') onEditCancel();
                            }}
                        />
                        <button
                            onClick={onEditSave}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="저장"
                        >
                            <Check className="w-4 h-4" weight="bold" />
                        </button>
                        <button
                            onClick={onEditCancel}
                            className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                            title="취소"
                        >
                            <X className="w-4 h-4" weight="bold" />
                        </button>
                    </>
                ) : (
                    <>
                        <span className="flex-1 text-sm font-medium text-slate-700">
                            {category.name}
                            {category.isDefault && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                                    기본
                                </span>
                            )}
                        </span>
                        <button
                            onClick={() => onEditStart(category)}
                            className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                            title="수정"
                        >
                            <PencilSimple className="w-4 h-4" weight="regular" />
                        </button>
                        {!category.isDefault &&
                            (isDeleting ? (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={onDelete}
                                        className="px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                                    >
                                        삭제
                                    </button>
                                    <button
                                        onClick={onDeleteCancel}
                                        className="px-2 py-1 text-xs text-slate-600 bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                                    >
                                        취소
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onDeleteConfirm(category.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                    title="삭제"
                                >
                                    <Trash className="w-4 h-4" weight="regular" />
                                </button>
                            ))}
                    </>
                )}
            </div>
        );
    }
);

CategoryRow.displayName = 'CategoryRow';

interface NewCategoryFormProps {
    value: string;
    isAdding: boolean;
    onChange: (value: string) => void;
    onSubmit: () => void;
}

const NewCategoryForm = memo(({ value, isAdding, onChange, onSubmit }: NewCategoryFormProps) => (
    <div className="flex gap-2 pt-2">
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="새 카테고리 이름"
            className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
            onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit();
            }}
        />
        <Button onClick={onSubmit} disabled={!value.trim() || isAdding} className="gap-2">
            <Plus className="w-4 h-4" weight="bold" />
            추가
        </Button>
    </div>
));

NewCategoryForm.displayName = 'NewCategoryForm';

export const CategoryManagement = memo(() => {
    const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useFirestoreCategories();

    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // 새 카테고리 추가
    const handleAdd = async () => {
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) return;

        try {
            setIsAdding(true);
            const result = await addCategory(trimmedName);
            if (result.ok) {
                showSuccess(`${trimmedName} 카테고리를 추가했습니다.`);
                setNewCategoryName('');
            } else {
                showError(result.message);
            }
        } catch {
            // 에러는 훅에서 처리
        } finally {
            setIsAdding(false);
        }
    };

    // 카테고리 수정 시작
    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    // 카테고리 수정 저장
    const handleUpdate = async () => {
        if (!editingId || !editingName.trim()) return;

        try {
            const result = await updateCategory(editingId, editingName.trim());
            if (result.ok) {
                showSuccess(`${editingName.trim()}로 변경했습니다.`);
                setEditingId(null);
                setEditingName('');
            } else {
                showError(result.message);
            }
        } catch {
            // 에러는 훅에서 처리
        }
    };

    // 카테고리 수정 취소
    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    // 카테고리 삭제 확인 시작
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const confirmDelete = (id: string) => setDeletingId(id);
    const cancelDelete = () => setDeletingId(null);

    // 카테고리 삭제 실행
    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            const categoryName = categories.find((cat) => cat.id === deletingId)?.name ?? '카테고리';
            const result = await deleteCategory(deletingId);
            if (result.ok) {
                showSuccess(`${categoryName} 카테고리를 삭제했습니다.`);
                setDeletingId(null);
            } else {
                showError(result.message);
            }
        } catch {
            // 에러는 훅에서 처리
        }
    };

    if (loading) {
        return <div className="py-8 text-center text-slate-500">로딩 중...</div>;
    }

    return (
        <div className="space-y-4">
            {/* 설명 */}
            <p className="text-sm text-slate-500">템플릿 분류에 사용할 카테고리를 관리합니다.</p>

            {/* 에러 메시지 */}
            {error && (
                <div className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>
            )}

            {/* 카테고리 목록 */}
            <div className="space-y-2">
                {categories.map((category) => (
                    <CategoryRow
                        key={category.id}
                        category={category}
                        editingId={editingId}
                        editingName={editingName}
                        deletingId={deletingId}
                        onEditStart={startEdit}
                        onEditChange={setEditingName}
                        onEditSave={handleUpdate}
                        onEditCancel={cancelEdit}
                        onDeleteConfirm={confirmDelete}
                        onDeleteCancel={cancelDelete}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* 새 카테고리 추가 */}
            <NewCategoryForm value={newCategoryName} isAdding={isAdding} onChange={setNewCategoryName} onSubmit={handleAdd} />
        </div>
    );
});

CategoryManagement.displayName = 'CategoryManagement';
