import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signIn, signUp } from '@/lib/auth-client';
import { signupSchema } from '@/lib/schemas/auth';
import { cn } from '@/lib/utils';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        const { error } = await signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
        });

        if (error) {
          if (error.status === 409) {
            toast.error('Email already exists');
            form.setFieldMeta('email', (meta) => ({
              ...meta,
              isTouched: true,
              errors: ['This email is already registered'],
            }));
          } else {
            toast.error(error.message ?? 'Signup failed');
          }
          return;
        }

        toast.success('Account created!', {
          description: 'Please check your email for a verification link.',
        });
        router.navigate({ to: '/auth/verify/pending' });
      } catch (err) {
        toast.error('Unexpected error');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className={cn('flex flex-col gap-6 mt-10', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground">
                  Enter your details below to get started
                </p>
              </div>

              {/* Name */}
              <form.Field
                children={(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      disabled={isLoading}
                      id={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                      value={field.state.value}
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
                name="name"
              />

              {/* Email */}
              <form.Field
                children={(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      disabled={isLoading}
                      id={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      value={field.state.value}
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
                name="email"
              />

              {/* Password Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field
                  children={(field) => (
                    <Field
                      data-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <div className="relative">
                        <Input
                          className="pr-10"
                          disabled={isLoading}
                          id={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type={showPassword ? 'text' : 'password'}
                          value={field.state.value}
                        />
                        <Button
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword((v) => !v)}
                          size="icon"
                          tabIndex={-1}
                          type="button"
                          variant="ghost"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Field>
                  )}
                  name="password"
                />

                <form.Field
                  children={(field) => (
                    <Field
                      data-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <FieldLabel htmlFor={field.name}>Confirm</FieldLabel>
                      <div className="relative">
                        <Input
                          className="pr-10"
                          disabled={isLoading}
                          id={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={field.state.value}
                        />
                        <Button
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          size="icon"
                          tabIndex={-1}
                          type="button"
                          variant="ghost"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Field>
                  )}
                  name="confirmPassword"
                />
              </div>

              {/* Global Password Errors */}
              <form.Subscribe
                children={([passMeta, confirmMeta]) =>
                  (passMeta?.errors.length > 0 ||
                    confirmMeta?.errors.length > 0) && (
                    <div className="text-[0.8rem] font-medium text-destructive">
                      {passMeta?.errors[0] || confirmMeta?.errors[0]}
                    </div>
                  )
                }
                selector={(state) => [
                  state.fieldMeta.password,
                  state.fieldMeta.confirmPassword,
                ]}
              />

              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <FieldSeparator>Or continue with</FieldSeparator>

              <Button
                disabled={isLoading}
                onClick={() =>
                  signIn.social({
                    provider: 'google',
                    callbackURL: '/dashboard/profile',
                  })
                }
                type="button"
                variant="outline"
              >
                Google
              </Button>

              <FieldDescription className="text-center">
                Already have an account?{' '}
                <Link className="font-medium underline" href="/auth/signin">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              alt="Signup illustration"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-40"
              height={600}
              src="/placeholder.svg"
              width={600}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
