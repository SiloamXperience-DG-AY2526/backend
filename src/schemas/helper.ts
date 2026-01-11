import z from 'zod';

export const preprocessDate = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof Date) {
    return new Date(val);
  }
}, z.date().optional());

export const PageType = z
  .string()
  .transform((val) => parseInt(val, 10))
  .or(z.number())
  .optional()
  .default(1);

export const LimitType = z
  .string()
  .transform((val) => parseInt(val, 10))
  .or(z.number())
  .optional()
  .default(10);

export const PageLimitType = {
  page: PageType,
  limit: LimitType
};