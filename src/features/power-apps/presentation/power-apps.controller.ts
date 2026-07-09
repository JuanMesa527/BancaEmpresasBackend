import type { NextFunction, Request, Response } from 'express';
import type { ZodError } from 'zod';
import { submitPowerAppUseCase } from '../application/submit-power-app.use-case.js';
import { submitPowerAppSchema } from '../application/dtos/submit-power-app.dto.js';
import type { ValidationIssue } from '../domain/validation-issue.js';

function mapZodIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    code: 'REQUIRED_FIELD' as const,
    field: issue.path.join('.'),
    message: issue.message,
    severity: 'error' as const,
  }));
}

export function submitPowerAppHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const parsed = submitPowerAppSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        decision: 'RECHAZADO',
        valid: false,
        radicado: null,
        issues: mapZodIssues(parsed.error),
        summary: 'La solicitud no cumple el formato esperado de la Power App.',
        siguientePaso: 'Revise los campos obligatorios y el formato de la solicitud.',
      });
      return;
    }

    const result = submitPowerAppUseCase(parsed.data);
    const statusCode = result.valid ? 201 : 422;

    res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
}
