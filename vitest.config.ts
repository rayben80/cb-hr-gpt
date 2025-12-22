import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/App.tsx', // App 컴포넌트는 통합 테스트에서 다룸
        'src/components/RestructuringWizard.tsx', // 너무 복잡한 컴포넌트는 제외
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    },
  },
})