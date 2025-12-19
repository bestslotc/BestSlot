'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type z from 'zod';
import bkash from '@/assets/bkash.webp';
import nagad from '@/assets/nagad.webp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { depositFormSchema, verifyFormSchema } from '@/lib/schemas/deposit';
import { cn } from '@/lib/utils';
import { useDepositMutation } from '@/services/user/deposit/use-deposit-mutation';

export function DepositForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'deposit' | 'verify'>('deposit');
  const [copied, setCopied] = useState(false);
  const [depositData, setDepositData] = useState<z.infer<
    typeof depositFormSchema
  > | null>(null);

  const depositForm = useForm<z.infer<typeof depositFormSchema>>({
    resolver: zodResolver(depositFormSchema),
    mode: 'onChange',
    defaultValues: {
      paymentMethod: 'BKASH',
      senderNumber: '',
      amount: 0,
    },
  });

  const verifyForm = useForm<z.infer<typeof verifyFormSchema>>({
    resolver: zodResolver(verifyFormSchema),
    mode: 'onChange',
    defaultValues: {
      paymentTransactionId: '',
      proofImageUrl: '',
    },
  });

  const { isPending, mutate } = useDepositMutation({
    onSuccess: () => {
      setStep('deposit');
      depositForm.reset();
      verifyForm.reset();
      setDepositData(null);
    },
  });

  const handleDepositSubmit = depositForm.handleSubmit(async (data) => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      setDepositData(data);

      setStep('verify');
    }, 500);
  });

  const handleVerifySubmit = verifyForm.handleSubmit(async (data) => {
    if (!depositData) {
      toast.error('Error', {
        description:
          'Initial deposit data is missing. Please restart the process.',
      });
      return;
    }
    const payload = {
      ...depositData, // Include original deposit data
      paymentTransactionId: data.paymentTransactionId,
      proofImageUrl: data.proofImageUrl || '',
    };
    mutate(payload);
  });

  const handleCopyWallet = (walletAddress: string) => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  const selectedMethod = depositForm.watch('paymentMethod');
  const walletAddress =
    selectedMethod === 'BKASH' ? '017XXXXXXXX' : '018XXXXXXXX';

  const isDepositFormValid =
    !depositForm.formState.errors.amount &&
    !depositForm.formState.errors.senderNumber &&
    !depositForm.formState.errors.paymentMethod &&
    depositForm.watch('senderNumber') !== '';

  const isVerifyFormValid =
    !verifyForm.formState.errors.paymentTransactionId &&
    verifyForm.watch('paymentTransactionId') !== '';

  if (step === 'verify' && depositData) {
    return (
      <Card className='w-full max-w-lg border-border shadow-xl'>
        <CardHeader className='space-y-1'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20'>
            <CheckCircle2 className='h-8 w-8 ' />
          </div>
          <CardTitle className='text-center text-2xl font-bold text-foreground'>
            Verify Transaction
          </CardTitle>
          <CardDescription className='text-center text-muted-foreground'>
            Please complete the payment on your{' '}
            {depositData.paymentMethod === 'BKASH' ? 'bKash' : 'Nagad'} app and
            enter the transaction ID below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifySubmit} className='space-y-6'>
            <div className='rounded-lg bg-muted/50 p-4 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Amount</span>
                <span className='font-semibold text-foreground'>
                  {depositData.amount} BDT
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Method</span>
                <span className='font-semibold text-foreground capitalize'>
                  {depositData.paymentMethod}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Your Number</span>
                <span className='font-semibold text-foreground'>
                  {depositData.senderNumber}
                </span>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                <Wallet className='h-4 w-4' />
                <span>Send Money To</span>
              </div>

              <div className='rounded-lg border-2 border-secondary/20 bg-secondary/5 p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs text-muted-foreground'>
                      {depositData.paymentMethod === 'BKASH'
                        ? 'bKash'
                        : 'Nagad'}{' '}
                      Wallet Number
                    </p>
                    <p className='text-2xl font-bold text-foreground tracking-wider'>
                      {walletAddress}
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => handleCopyWallet(walletAddress)}
                    className='h-9 gap-2'
                  >
                    <Copy className='h-4 w-4' />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <Alert className='border-amber-500/50 bg-amber-500/10'>
                <AlertCircle className='h-4 w-4 text-amber-600' />
                <AlertDescription className='text-sm text-foreground '>
                  <p>
                    <span>
                      <strong>Important: </strong>
                    </span>
                    We only accept{' '}
                    <strong className='text-primary'>Send Money</strong> to this
                    wallet. Please send the exact amount of{' '}
                    <strong className='text-primary'>
                      {depositData.amount}
                    </strong>{' '}
                    BDT. Otherwise, the deposit will not be credited.
                  </p>
                </AlertDescription>
              </Alert>
            </div>

            <Field>
              <FieldLabel>Transaction ID (TrxID)</FieldLabel>
              <Input
                type='text'
                placeholder='Enter transaction ID (e.g., 8N7A5B2C3D)'
                {...verifyForm.register('paymentTransactionId')}
                className='h-12 border-border bg-background text-foreground'
              />
              <FieldDescription>
                You will receive the transaction ID from{' '}
                {depositData.paymentMethod} after completing the payment
              </FieldDescription>
              <FieldError>
                {verifyForm.formState.errors.paymentTransactionId?.message}
              </FieldError>
            </Field>
            {/* 
            <Field>
              <FieldLabel>Proof Image URL (Optional)</FieldLabel>
              <Input
                type='url'
                placeholder='https://example.com/proof.jpg'
                {...verifyForm.register('proofImageUrl')}
                className='h-12 border-border bg-background text-foreground'
              />
              <FieldDescription>
                Optional: Provide a URL to your payment screenshot
              </FieldDescription>
              <FieldError>
                {verifyForm.formState.errors.proofImageUrl?.message}
              </FieldError>
            </Field> */}

            <div className='space-y-3'>
              <Button
                type='submit'
                disabled={isPending || !isVerifyFormValid}
                className='h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90'
              >
                {isPending ? (
                  <span className='flex items-center gap-2'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Complete Deposit'
                )}
              </Button>

              <Button
                type='button'
                variant='ghost'
                onClick={() => setStep('deposit')}
                className='w-full text-muted-foreground hover:text-foreground'
                disabled={isPending}
              >
                Back to Deposit Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-lg border-border shadow-xl'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-foreground'>
          Make a Deposit
        </CardTitle>
        <CardDescription className='text-muted-foreground'>
          Select your payment method and enter the amount
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDepositSubmit} className='space-y-6'>
          <Field>
            <FieldLabel>Payment Method</FieldLabel>
            <RadioGroup
              value={depositForm.watch('paymentMethod')}
              onValueChange={(value) =>
                depositForm.setValue(
                  'paymentMethod',
                  value as 'BKASH' | 'NAGAD',
                )
              }
              className='grid gap-3'
            >
              <label
                htmlFor='bkash'
                className={cn(
                  'relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all',
                  selectedMethod === 'BKASH'
                    ? 'border-secondary bg-secondary/5 shadow-sm'
                    : 'border-border bg-card hover:border-secondary/50',
                )}
              >
                <RadioGroupItem
                  value='BKASH'
                  id='bkash'
                  className='text-secondary'
                />
                <div className='flex items-center gap-3'>
                  <Image
                    src={bkash}
                    alt='bKash'
                    width={48}
                    height={48}
                    className='object-cover rounded'
                  />
                  <div className='flex-1'>
                    <div className='font-semibold text-foreground'>bKash</div>
                    <div className='text-xs text-muted-foreground'>
                      Mobile wallet payment
                    </div>
                  </div>
                </div>
                {selectedMethod === 'BKASH' && (
                  <CheckCircle2 className='absolute right-4 h-5 w-5 text-secondary' />
                )}
              </label>

              <label
                htmlFor='nagad'
                className={cn(
                  'relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all',
                  selectedMethod === 'NAGAD'
                    ? 'border-secondary bg-secondary/5 shadow-sm'
                    : 'border-border bg-card hover:border-secondary/50',
                )}
              >
                <RadioGroupItem
                  value='NAGAD'
                  id='nagad'
                  className='text-secondary'
                />
                <div className='flex items-center gap-3'>
                  <Image
                    src={nagad}
                    alt='Nagad'
                    width={48}
                    height={48}
                    className='object-cover rounded'
                  />
                  <div className='flex-1'>
                    <div className='font-semibold text-foreground'>Nagad</div>
                    <div className='text-xs text-muted-foreground'>
                      Digital financial service
                    </div>
                  </div>
                </div>
                {selectedMethod === 'NAGAD' && (
                  <CheckCircle2 className='absolute right-4 h-5 w-5 text-secondary' />
                )}
              </label>
            </RadioGroup>
            <FieldError>
              {depositForm.formState.errors.paymentMethod?.message}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel>
              {selectedMethod === 'BKASH' ? 'bKash' : 'Nagad'} Number
            </FieldLabel>
            <Input
              type='tel'
              placeholder='01XXXXXXXXX'
              {...depositForm.register('senderNumber')}
              className='h-12 border-border bg-background text-foreground'
            />
            <FieldError>
              {depositForm.formState.errors.senderNumber?.message}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel>Amount (BDT)</FieldLabel>
            <Input
              type='number'
              placeholder='Enter amount'
              {...depositForm.register('amount', { valueAsNumber: true })}
              className='h-12 border-border bg-background text-foreground'
            />
            <FieldDescription>
              Amount must be between 200 and 20,000 BDT
            </FieldDescription>
            <FieldError>
              {depositForm.formState.errors.amount?.message}
            </FieldError>
          </Field>

          <div className='space-y-2'>
            <FieldLabel className='text-sm font-medium text-muted-foreground'>
              Quick Select
            </FieldLabel>
            <div className='grid grid-cols-4 gap-2'>
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    depositForm.setValue('amount', quickAmount, {
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    'h-10 border-border bg-card text-foreground hover:border-secondary hover:bg-secondary/10 hover:text-secondary',
                    depositForm.watch('amount') === quickAmount &&
                      'border-secondary bg-secondary/10 text-secondary',
                  )}
                >
                  {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type='submit'
            disabled={isProcessing || !isDepositFormValid}
            className='h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90'
          >
            {isProcessing ? (
              <span className='flex items-center gap-2'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                Processing...
              </span>
            ) : (
              <span className='flex items-center gap-2'>
                Continue to Payment
                <ArrowRight className='h-4 w-4' />
              </span>
            )}
          </Button>

          <p className='text-center text-xs leading-relaxed text-muted-foreground'>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Deposit amount must be between 200 and 20,000 BDT.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
