import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { sendEmailAction } from '@/actions/send-email-action';
import { DeleteImage } from '@/cloudinary/delete-image';
import { prisma } from './prisma';

export const auth = betterAuth({
  databaseHooks: {
    user: {
      update: {
        before: async (data, ctx) => {
          // If image is a special string, parse it into image and imageId
          if (typeof data.image === 'string' && data.image.includes('|')) {
            const [imageUrl, imageId] = data.image.split('|');
            data.image = imageUrl;
            data.imageId = imageId;
          }
          if (data.image || data.imageId) {
            if (ctx?.context?.session) {
              const session = ctx.context.session;
              if (session?.user.userId) {
                const user = await prisma.user.findUnique({
                  where: { id: session.user.userId },
                  select: { imageId: true },
                });

                if (user?.imageId) {
                  DeleteImage(user.imageId).catch((err) => {
                    console.error('Failed to delete old profile image', err);
                  });
                }
              }
            }
          }
          return { data };
        },
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [`${process.env.NEXT_PUBLIC_API_URL}`],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmailAction({
        to: user.email,
        subject: 'Reset your password',
        meta: {
          description:
            'You are receiving this email because you have requested to reset your password. Click the button below to reset your password.',
          link: url,
          callToActionText: 'Reset Password',
        },
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    expiresIn: 60 * 60,

    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set('callbackURL', '/auth/verify');
      await sendEmailAction({
        to: user.email,
        subject: 'Verify your email address',
        meta: {
          description:
            'Please verify your email address to complete the registration process. Click the button below to verify your email and activate your account.',
          link: String(link),
          callToActionText: 'Verify Email Address',
        },
      });
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
  },
});
