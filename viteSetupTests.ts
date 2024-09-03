import { vi } from 'vitest'

// If this isn't mocked globally, every test will fail the jwt check
vi.mock('./src/hooks/jwtCheck', () => ({
  default: vi.fn().mockResolvedValue({}),
}))
