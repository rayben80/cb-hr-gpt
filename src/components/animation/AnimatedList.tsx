import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';

interface AnimatedListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor: (item: T, index: number) => string;
    className?: string;
    itemClassName?: string;
}

/**
 * 리스트 아이템이 순차적으로 등장하는 애니메이션 컴포넌트
 * 
 * @example
 * <AnimatedList
 *   items={users}
 *   keyExtractor={(user) => user.id}
 *   renderItem={(user) => <UserCard user={user} />}
 * />
 */
function AnimatedListInner<T>({
    items,
    renderItem,
    keyExtractor,
    className = '',
    itemClassName = '',
}: AnimatedListProps<T>) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {items.map((item, index) => (
                <motion.div
                    key={keyExtractor(item, index)}
                    variants={staggerItem}
                    className={itemClassName}
                >
                    {renderItem(item, index)}
                </motion.div>
            ))}
        </motion.div>
    );
}

export const AnimatedList = memo(AnimatedListInner) as typeof AnimatedListInner;
