import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from './auth';

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders() as unknown as Headers,
    });
    return await next({
      context: {
        user: {
          id: session?.user.id,
          name: session?.user.name,
          email: session?.user.email,
          image: session?.user.image,
          role: session?.user.role,
        },
      },
    });
  },
);
