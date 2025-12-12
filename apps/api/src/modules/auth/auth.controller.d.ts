import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types';
export declare const authController: {
    /**
     * POST /api/auth/login
     */
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/auth/register
     * Requiere autenticación como ADMIN
     */
    register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/auth/me
     * Requiere autenticación
     */
    me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/auth/change-password
     * Requiere autenticación
     */
    changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map