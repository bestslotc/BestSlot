import z from 'zod';

export const betPlacementSchema = z.object({
  amount: z
    .number()
    .min(10, 'Minimum deposit is 200 BDT')
    .max(20000, 'Maximum deposit is 20,000 BDT'),
});
