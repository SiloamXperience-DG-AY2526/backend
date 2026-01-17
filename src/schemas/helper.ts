import z from 'zod';

export const preprocessDate = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof Date) {
    return new Date(val);
  }
}, z.date().optional());

export const PageType = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().min(1, 'Page must be at least 1'))
  .or(z.number().min(1, 'Page must be at least 1'))
  .optional()
  .default(1);

export const LimitType = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must not exceed 100'))
  .or(z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must not exceed 100'))
  .optional()
  .default(10);

export const PageLimitType = {
  page: PageType,
  limit: LimitType
};