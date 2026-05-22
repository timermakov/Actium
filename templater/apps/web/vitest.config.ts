import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        // Only testable logic - utils, services, hooks
        'src/utils/**/*',
        'src/shared/api/**/*',
        'src/features/**/authService.tsx',
        'src/features/**/userService.tsx',
        'src/features/**/*Context*',
        'src/types/**/*',
      ],
      exclude: [
        // Entry points
        'src/main.tsx',
        'src/App.tsx',
        'src/app/**/*',
        // Pages (E2E tested)
        'src/pages/**/*',
        // UI Components (visually tested)
        'src/components/**/*',
        'src/shared/*.tsx',
        'src/features/**/*.tsx',
        '!src/features/**/authService.tsx',
        '!src/features/**/userService.tsx',
        '!src/features/**/*Context*',
        // i18n config
        'src/i18n/**/*',
        // Test files
        'tests/**/*',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.test.tsx',
        // Coverage directory
        'coverage/**/*',
        // Config files
        '*.config.ts',
        '*.config.js',
        'node_modules/**/*',
      ]
    }
  }
})
