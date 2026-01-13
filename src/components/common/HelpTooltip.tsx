import { Question } from '@phosphor-icons/react';
import { memo, ReactNode } from 'react';
import { Tooltip } from './index';

interface HelpTooltipProps {
    content: ReactNode;
}

/**
 * 도움말 아이콘 + 툴팁 컴포넌트
 * 폼 필드 레이블 옆에 사용하여 추가 설명 제공
 *
 * @example
 * <label>
 *   템플릿 이름 <HelpTooltip content="템플릿 이름은 목록에서 구분하기 쉽게 작성하세요." />
 * </label>
 */
export const HelpTooltip = memo(({ content }: HelpTooltipProps) => (
    <Tooltip content={content} side="top">
        <button
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 ml-1 text-slate-400 hover:text-slate-600 transition-colors cursor-help"
            aria-label="도움말"
        >
            <Question className="w-3.5 h-3.5" weight="bold" />
        </button>
    </Tooltip>
));

HelpTooltip.displayName = 'HelpTooltip';
