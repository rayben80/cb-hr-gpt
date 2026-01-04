// Example: How to use the new UI components
// This file demonstrates the migration pattern from old to new components

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { DotsThree, PencilSimple, Plus, Trash } from '@phosphor-icons/react';

// ============================================
// 예시 1: 버튼 사용
// ============================================
export const ButtonExamples = () => (
    <div className="flex gap-2">
        {/* 기본 버튼 */}
        <Button>저장</Button>

        {/* 변형(Variants) */}
        <Button variant="outline">취소</Button>
        <Button variant="destructive">삭제</Button>
        <Button variant="ghost">더보기</Button>
        <Button variant="link">링크</Button>

        {/* 크기 */}
        <Button size="sm">작은 버튼</Button>
        <Button size="lg">큰 버튼</Button>

        {/* 아이콘과 함께 */}
        <Button>
            <Plus className="w-4 h-4 mr-2" />팀 추가
        </Button>
    </div>
);

// ============================================
// 예시 2: 모달(Dialog) 사용
// ============================================
export const DialogExample = () => (
    <Dialog>
        <DialogTrigger asChild>
            <Button>모달 열기</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>팀 추가</DialogTitle>
                <DialogDescription>새로운 팀을 생성합니다. 필수 정보를 입력해주세요.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Input placeholder="팀 이름" />
            </div>
            <DialogFooter>
                <Button variant="outline">취소</Button>
                <Button>저장</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

// ============================================
// 예시 3: 드롭다운 메뉴 사용
// ============================================
export const DropdownExample = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
                <DotsThree className="w-4 h-4" weight="bold" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem>
                <PencilSimple className="w-4 h-4 mr-2" weight="regular" />
                수정
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
                <Trash className="w-4 h-4 mr-2" weight="regular" />
                삭제
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

// ============================================
// 마이그레이션 가이드
// ============================================
/*
Before (기존):
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
    저장
</button>

After (새로운):
<Button>저장</Button>

Before (기존 모달):
{isModalOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
            ...
        </div>
    </div>
)}

After (새로운):
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
    <DialogContent>...</DialogContent>
</Dialog>
*/
