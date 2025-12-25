import { useState, useId } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { sendVerificationEmail } from '@/lib/auth-client';

export function SendVerificationEmailForm() {
  const navigate = useNavigate();
  const emailInputId = useId();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    await sendVerificationEmail({
      email,
      // Updated to your new TanStack route path
      callbackURL: '/auth/verify',
      fetchOptions: {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          const errorMessage =
            ctx.error.message || 'Failed to send verification email.';
          setError(errorMessage);
          toast.error(errorMessage);
        },
        onSuccess: () => {
          setSuccess(true);
          toast.success('Verification email sent successfully.');
          setEmail('');

          // Type-safe navigation in TanStack Start
          navigate({ to: '/auth/verify/success' });
        },
      },
    });

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success Alert */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Verification email sent successfully!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Check your inbox and follow the link to verify your email address.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <Label
          htmlFor={emailInputId}
          className="text-sm font-semibold tracking-tight"
        >
          Email Address
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id={emailInputId}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
            className="pl-10 transition-all"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || success}
        className="w-full font-semibold shadow-sm transition-all duration-200"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner className="h-4 w-4" /> Sending...
          </span>
        ) : success ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Sent Successfully
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Resend Verification Email
          </span>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
        Check your spam or promotions folder if you don't see the email within a
        few minutes.
      </p>
    </form>
  );
}
