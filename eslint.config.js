import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '**/simulation*.js',
            'tailwind.config.js',
            'src/dataconnect-generated/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            // React Hooks 규칙
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // 🛡️ 대형 파일 방지 규칙
            'max-lines': [
                'warn',
                {
                    max: 400, // 파일당 최대 400줄
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            'max-lines-per-function': [
                'warn',
                {
                    max: 150, // 함수당 최대 150줄 (React 컴포넌트 고려)
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            // 🔧 코드 복잡도 제한 규칙
            complexity: ['warn', 15], // 순환 복잡도 15 이하
            'max-depth': ['warn', 4], // 중첩 4단계 이하
            'max-params': ['warn', 5], // 함수 파라미터 5개 이하
            'max-nested-callbacks': ['warn', 3], // 콜백 3단계 이하
            'no-duplicate-imports': 'error', // 중복 import 금지

            // TypeScript 관련 (기존 코드 호환)
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-restricted-syntax': [
                'warn',
                {
                    selector:
                        'Literal[value=/.*(bg|text|border|ring)-(sky|blue)-(50|100|200|300|400|500|600|700|800|900).*/]',
                    message:
                        "Don't use hardcoded colors (sky, blue). Use semantic colors (primary, secondary, etc.) instead.",
                },
            ],
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    // Test files: relax max-lines-per-function rule
    {
        files: ['src/test/**/*.ts', 'src/test/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
        rules: {
            'max-lines-per-function': 'off',
            'max-lines': 'off',
        },
    }
);
