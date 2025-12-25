import { SendVerificationEmailForm } from '@/components/auth/send-verification-email-form';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Mail, XCircle } from 'lucide-react';

type SearchResult = {
  error?: string;
};

export const Route = createFileRoute('/auth/verify/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { error } = Route.useSearch() as SearchResult;

  const formattedError = error?.replace(/_/g, ' ').replace(/-/g, ' ');
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-accent/10 rounded-2xl blur-xl" />

          <div className="relative space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-3">
              <Link to="/auth/signin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Verify Email
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your account setup
                </p>
              </div>
            </div>

            {/* Main card */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex gap-3">
                  <div className="shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 capitalize">
                      {formattedError}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Please request a new verification email below
                    </p>
                  </div>
                </div>
              )}

              {/* Info section */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 flex gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Check your email
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    We'll send you a link to verify your email address
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <SendVerificationEmailForm />

            {/* Footer link */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Already verified?{' '}
                <Link
                  to="/auth/signin"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
