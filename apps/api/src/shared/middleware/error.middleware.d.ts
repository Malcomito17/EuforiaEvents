/**
 * EUFORIA EVENTS - Error Handler Middleware
 * Manejo centralizado de errores
 */
import { Request, Response, NextFunction } from 'express';
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=error.middleware.d.ts.map