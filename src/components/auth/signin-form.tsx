/** biome-ignore-all lint/correctness/noChildrenProp: this is fine */
import { useForm } from '@tanstack/react-form'
import { Link, useRouter } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { Eye, EyeOff, Info } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signIn } from '@/lib/auth-client'
import { loginSchema } from '@/lib/schemas/auth'
import { cn } from '@/lib/utils'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showVerificationLink, setShowVerificationLink] = React.useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true)

      try {
        const { error } = await signIn.email({
          email: value.email,
          password: value.password,
        })

        if (error) {
          if (error.status === 401) {
            toast.error('Invalid credentials')

            form.setFieldMeta('email', (meta) => ({
              ...meta,
              isTouched: true,
              errors: [' '],
            }))
            form.setFieldMeta('password', (meta) => ({
              ...meta,
              isTouched: true,
              errors: ['Invalid email or password'],
            }))
          } else if (error.status === 404) {
            toast.error('Account not found')

            form.setFieldMeta('email', (meta) => ({
              ...meta,
              isTouched: true,
              errors: ['No account found with this email'],
            }))
          } else if (error.status === 403) {
            toast.error('Email not verified')
            setShowVerificationLink(true)
          } else {
            toast.error(error.message ?? 'Login failed')
          }
          return
        }

        toast.success('Welcome back!')
        router.navigate({ to: '/dashboard/profile' })
      } catch (err) {
        toast.error('Unexpected error')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">Login to your BestSlot account</p>
              </div>

              {/* Email */}
              <form.Field
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        disabled={isLoading}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        value={field.state.value}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
                name="email"
              />

              {/* Password */}
              <form.Field
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Link className="ml-auto text-sm underline" to="/auth/forgot-password">
                          Forgot password?
                        </Link>
                      </div>

                      <div className="relative">
                        <Input
                          aria-invalid={isInvalid}
                          className="pr-10"
                          disabled={isLoading}
                          id={field.name}
                          name={field.name}
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

                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
                name="password"
              />

              {showVerificationLink && (
                <div className="bg-blue-50 border rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Didn’t receive the verification email?</span>
                  <Link className="font-bold" to="/auth/verify?error=lost-verification-email">
                    Send again
                  </Link>
                </div>
              )}

              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? 'Logging in...' : 'Login'}
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
                Don&apos;t have an account?{' '}
                <Link className="font-medium underline" to="/auth/signup">
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              alt="Login illustration"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-40"
              height={600}
              src="/placeholder.svg"
              width={600}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
