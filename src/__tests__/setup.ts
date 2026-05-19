import { vi } from "vitest";

// Mock Prisma at the system boundary — this is a database, which is a valid mock target per the TDD mocking guidelines.
// We mock the module so all route handlers get the mocked prisma instance.
vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      category: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      variant: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});
