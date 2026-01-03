import { z } from 'zod';

export const FinancialOverviewSchema = z.object({
  fiscalYear: z.number,
  committed: z.number,
  disbursed: z.number,
});

export type FinancialOverview = z.infer<typeof FinancialOverviewSchema>;
