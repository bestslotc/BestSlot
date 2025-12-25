import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/auth-client';

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const passwordStrength = {
    length: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const isStrongPassword = strengthScore >= 3;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    if (!password) return toast.error('Please enter your new password.');
    if (!isStrongPassword) return toast.error('Password is too weak.');
    if (password !== confirmPassword)
      return toast.error('Passwords do not match.');

    await resetPassword({
      newPassword: password,
      token,
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onError: (ctx) => {
          toast.error(ctx.error.message || 'Failed to reset password');
        },
        onSuccess: () => {
          toast.success('Password reset successfully!');
          // Type-safe navigation to sign-in
          navigate({ to: '/auth/signin' });
        },
      },
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* New Password Field */}
      <div className="space-y-3">
        <Label htmlFor="password font-medium">New Password</Label>
        <div className="relative">
          {/** biome-ignore lint/correctness/useUniqueElementIds: this is fine */}
          <Input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {password && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <PasswordCheck
                label="At least 6 characters"
                isValid={passwordStrength.length}
              />
              <PasswordCheck
                label="Uppercase letter"
                isValid={passwordStrength.hasUpper}
              />
              <PasswordCheck
                label="Lowercase letter"
                isValid={passwordStrength.hasLower}
              />
              <PasswordCheck
                label="Number"
                isValid={passwordStrength.hasNumber}
              />
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strengthScore <= 2
                    ? 'w-1/3 bg-destructive'
                    : strengthScore === 3
                      ? 'w-2/3 bg-yellow-500'
                      : 'w-full bg-green-500'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-3">
        <Label htmlFor="confirmPassword font-medium">Confirm Password</Label>
        <div className="relative">
          {/** biome-ignore lint/correctness/useUniqueElementIds: <this is fine */}
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || !isStrongPassword || !passwordsMatch}
        className="w-full"
        size="lg"
      >
        {isPending ? 'Resetting password...' : 'Reset Password'}
      </Button>
    </form>
  );
};

// Small helper component for the checklist
const PasswordCheck = ({
  label,
  isValid,
}: {
  label: string;
  isValid: boolean;
}) => (
  <div className="flex items-center gap-2">
    {isValid ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-destructive" />
    )}
    <span className={isValid ? 'text-green-500' : 'text-destructive'}>
      {label}
    </span>
  </div>
);
