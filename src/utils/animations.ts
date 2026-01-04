// Animation utilities using framer-motion
// Usage examples for the project

import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';

// ============================================================
// 트랜지션 프리셋
// ============================================================

export const defaultTransition: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};

export const quickTransition: Transition = {
    duration: 0.15,
    ease: 'easeOut',
};

// ============================================================
// 기본 애니메이션 Variants
// ============================================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const slideUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export const slideDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

export const slideRight: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

// ============================================================
// 리스트 애니메이션 (stagger)
// ============================================================

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        }
    }
};

export const listItem: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: defaultTransition,
    }
};

// ============================================================
// 호버/탭 효과
// ============================================================

export const hoverScale = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: quickTransition,
};

export const hoverLift = {
    whileHover: { y: -2, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' },
    transition: quickTransition,
};

// ============================================================
// 페이지 전환
// ============================================================

export const pageTransition: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 },
    },
};

// Re-export for convenience
export { motion, AnimatePresence };
