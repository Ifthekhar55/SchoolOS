import { NextFunction, Request, Response } from 'express';
import { z, ZodType } from 'zod';

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export const validate = (schemas: RequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, z.ZodIssue[]> = {};

    for (const location of ['body', 'params', 'query'] as const) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location]);
      if (!result.success) {
        errors[location] = result.error.issues;
        continue;
      }

      req[location] = result.data;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request input',
        errors,
      });
    }

    return next();
  };
};
