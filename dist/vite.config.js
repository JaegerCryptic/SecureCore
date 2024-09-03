"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// vite.config.ts
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        coverage: {
            provider: 'istanbul',
            reporter: ['html', 'text', 'text-summary', 'cobertura'],
            include: ['src/**/*.ts'],
            all: true,
        },
        setupFiles: ['./viteSetupTests.ts'],
    },
});
