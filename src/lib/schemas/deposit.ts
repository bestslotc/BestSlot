import z from 'zod';

export const depositFormSchema = z.object({
  paymentMethod: z.enum(['BKASH', 'NAGAD']),
  senderNumber: z
    .string()
    .regex(
      /^01[3-9]\d{8}$/,
      'Invalid Bangladesh phone number (e.g., 01712345678)',
    ),
  amount: z
    .number()
    .min(200, 'Minimum deposit is 200 BDT')
    .max(20000, 'Maximum deposit is 20,000 BDT'),
});

export const verifyFormSchema = z.object({
  paymentTransactionId: z
    .string()
    .min(5, 'Transaction ID must be at least 5 characters')
    .max(50, 'Transaction ID is too long'),
  proofImageUrl: z.string().url().optional().or(z.literal('')),
});
