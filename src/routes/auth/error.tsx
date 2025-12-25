import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertCircle, Home, Mail } from 'lucide-react';
import { z } from 'zod';

// Define the search schema to expect an 'error' key
const errorSearchSchema = z.object({
  error: z.string().optional().catch('invalid_credentials'),
});

export const Route = createFileRoute('/auth/error')({
  component: RouteComponent,
  validateSearch: (search) => errorSearchSchema.parse(search),
});

function RouteComponent() {
  // Destructure 'error' from the type-safe search object
  const { error } = Route.useSearch();

  const errorMessages: Record<string, { title: string; description: string }> =
    {
      invalid_credentials: {
        title: 'Invalid Credentials',
        description:
          'The email or password you entered is incorrect. Please try again.',
      },
      user_not_found: {
        title: 'Account Not Found',
        description:
          "We couldn't find an account with that email. Please check and try again.",
      },
      email_not_verified: {
        title: 'Email Not Verified',
        description: 'Please verify your email address before signing in.',
      },
      account_disabled: {
        title: 'Account Disabled',
        description:
          'Your account has been disabled. Contact support for assistance.',
      },
      too_many_attempts: {
        title: 'Too Many Attempts',
        description:
          'Too many failed login attempts. Please try again later or reset your password.',
      },
    };

  // Determine content based on the error code
  const errorKey = error || 'invalid_credentials';
  const { title, description } =
    errorMessages[errorKey] || errorMessages.invalid_credentials;

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-background/95 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full" />
              <div className="relative bg-destructive/10 rounded-full p-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link to="/auth/signin" className="block w-full">
              <Button className="w-full" size="lg">
                Try Again
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link to="/auth/forgot-password">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  size="sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
              </Link>

              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{' '}
              <Link
                to="/support"
                className="text-primary hover:underline font-medium"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
