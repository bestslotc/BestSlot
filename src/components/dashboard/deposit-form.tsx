import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type z from 'zod';
// Logic & Assets
import bkash from '@/assets/bkash.webp';
import nagad from '@/assets/nagad.webp';
// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
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
      // Success toast is usually handled inside the mutation hook or here
      toast.success('Deposit request submitted successfully');
    },
  });

  const handleDepositSubmit = depositForm.handleSubmit(async (data) => {
    setIsProcessing(true);
    // Simulating API check or prep
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsProcessing(false);
    setDepositData(data);
    setStep('verify');
  });

  const handleVerifySubmit = verifyForm.handleSubmit(async (data) => {
    if (!depositData) {
      toast.error('Session expired', {
        description: 'Initial deposit data is missing. Please restart.',
      });
      return;
    }

    mutate({
      ...depositData,
      paymentTransactionId: data.paymentTransactionId,
      proofImageUrl: data.proofImageUrl || '',
    });
  });

  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedMethod = depositForm.watch('paymentMethod');
  const walletAddress =
    selectedMethod === 'BKASH' ? '017XXXXXXXX' : '018XXXXXXXX';
  const quickAmounts = [500, 1000, 2000, 5000];

  // Logic Helpers
  const isDepositFormValid =
    depositForm.formState.isValid && depositForm.watch('senderNumber') !== '';
  const isVerifyFormValid =
    verifyForm.formState.isValid &&
    verifyForm.watch('paymentTransactionId') !== '';

  if (step === 'verify' && depositData) {
    return (
      <Card className="w-full max-w-lg border-border shadow-xl animate-in fade-in zoom-in duration-300">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Verify Transaction
          </CardTitle>
          <CardDescription className="text-center">
            Complete the payment on your{' '}
            {selectedMethod === 'BKASH' ? 'bKash' : 'Nagad'} app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleVerifySubmit}>
            {/* Transaction Summary */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{depositData.amount} BDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-bold capitalize">
                  {depositData.paymentMethod.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wallet className="h-4 w-4" />
                <span>Send Money To</span>
              </div>
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Wallet Number</p>
                  <p className="text-2xl font-bold tracking-wider">
                    {walletAddress}
                  </p>
                </div>
                <Button
                  onClick={() => handleCopyWallet(walletAddress)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  Exact amount <strong>{depositData.amount} BDT</strong> must be
                  sent via <strong>Send Money</strong>.
                </AlertDescription>
              </Alert>
            </div>

            <Field>
              <FieldLabel>Transaction ID (TrxID)</FieldLabel>
              <Input
                placeholder="Enter transaction ID"
                {...verifyForm.register('paymentTransactionId')}
                className="h-12"
              />
              <FieldError>
                {verifyForm.formState.errors.paymentTransactionId?.message}
              </FieldError>
            </Field>

            <div className="space-y-3">
              <Button
                className="h-12 w-full"
                disabled={isPending || !isVerifyFormValid}
                type="submit"
              >
                {isPending ? 'Verifying...' : 'Verify & Complete Deposit'}
              </Button>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => setStep('deposit')}
                type="button"
                variant="ghost"
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
    <Card className="w-full max-w-lg border-border shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Make a Deposit</CardTitle>
        <CardDescription>Select payment method and amount</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleDepositSubmit}>
          <Field>
            <FieldLabel>Payment Method</FieldLabel>
            <RadioGroup
              className="grid gap-3"
              onValueChange={(val) =>
                depositForm.setValue('paymentMethod', val as 'BKASH' | 'NAGAD')
              }
              value={selectedMethod}
            >
              {[
                { id: 'BKASH', label: 'bKash', img: bkash },
                { id: 'NAGAD', label: 'Nagad', img: nagad },
              ].map((method) => (
                <label
                  className={cn(
                    'relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all',
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card',
                  )}
                  htmlFor={method.id.toLowerCase()}
                  key={method.id}
                >
                  <RadioGroupItem
                    id={method.id.toLowerCase()}
                    value={method.id}
                  />
                  <img
                    alt={method.label}
                    className="h-12 w-12 rounded object-cover"
                    src={method.img}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{method.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Mobile Wallet
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </label>
              ))}
            </RadioGroup>
          </Field>

          <Field>
            <FieldLabel>
              {selectedMethod === 'BKASH' ? 'bKash' : 'Nagad'} Number
            </FieldLabel>
            <Input
              placeholder="01XXXXXXXXX"
              type="tel"
              {...depositForm.register('senderNumber')}
              className="h-12"
            />
            <FieldError>
              {depositForm.formState.errors.senderNumber?.message}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel>Amount (BDT)</FieldLabel>
            <Input
              placeholder="Enter amount"
              type="number"
              {...depositForm.register('amount', { valueAsNumber: true })}
              className="h-12"
            />
            <FieldError>
              {depositForm.formState.errors.amount?.message}
            </FieldError>
          </Field>

          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amt) => (
              <Button
                className={cn(
                  depositForm.watch('amount') === amt &&
                    'border-primary bg-primary/10 text-primary',
                )}
                key={amt}
                onClick={() =>
                  depositForm.setValue('amount', amt, { shouldValidate: true })
                }
                type="button"
                variant="outline"
              >
                {amt}
              </Button>
            ))}
          </div>

          <Button
            className="h-12 w-full"
            disabled={isProcessing || !isDepositFormValid}
            type="submit"
          >
            {isProcessing ? 'Processing...' : 'Continue to Payment'}
            {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
