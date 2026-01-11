import { z } from 'zod';
import {  PageLimitType } from '../helper';

export const DonorIdSchema = z.object({
  donorId: z.uuid(),
});

// Schema for getting donation history with filters
export const DonorQuerySchema = z.object({
  ...PageLimitType
});

export type DonorQueryType = z.infer<typeof DonorQuerySchema>;

export const DonorDetailQuerySchema = z.object({
  donorId: z.uuid(),
  ...PageLimitType
});

export type DonorDetailQueryType = z.infer<typeof DonorDetailQuerySchema>;
