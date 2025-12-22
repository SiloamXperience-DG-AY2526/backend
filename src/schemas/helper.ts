import z from 'zod';

export const preprocessDate = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof Date) {
    return new Date(val);
  }
}, z.date().optional());
