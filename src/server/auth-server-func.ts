import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from '@/lib/auth-middleware';

export const getUserSession = createServerFn({ method: 'GET' })
  .middleware([authMiddleware]) // This ensures the check runs on the server
  .handler(async ({ context }) => {
    return context?.user;
  });
