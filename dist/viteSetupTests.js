"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// If this isn't mocked globally, every test will fail the jwt check
vitest_1.vi.mock('./src/hooks/jwtCheck', () => ({
    default: vitest_1.vi.fn().mockResolvedValue({}),
}));
