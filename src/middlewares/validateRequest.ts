/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { formatZodErrors, ValidationError } from '../utils/errors';

type Schemas = {
  body?: z.ZodType<any>;
  params?: z.ZodType<any>;
  query?: z.ZodType<any>;
};

export const validateRequest =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError(
            'Invalid request body',
            formatZodErrors(parsed.error)
          );
        }
        req.body = parsed.data;
      }

      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) {
          throw new ValidationError(
            'Invalid route parameters',
            formatZodErrors(parsed.error)
          );
        }
        req.params = parsed.data;
      }

      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) {
          throw new ValidationError(
            'Invalid query parameters',
            formatZodErrors(parsed.error)
          );
        }
        req.query = parsed.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
