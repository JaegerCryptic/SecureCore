// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'text', 'text-summary', 'cobertura'],
      include: ['src/**/*.ts'],
      all: true,
    },
    setupFiles: ['./viteSetupTests.ts'],
  },
})
