import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                role: string;
            };
        }
    }
}
/**
 * Middleware para verificar que el usuario tiene rol específico
 */
export declare function requireRole(...allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware para verificar permisos sobre un módulo específico
 */
export declare function requireModuleAccess(module: 'MUSICADJ' | 'KARAOKEYA', action?: 'VIEW' | 'OPERATE' | 'EXPORT'): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware para verificar que el usuario es dueño del recurso
 */
export declare function requireOwnership(resourceUserIdField?: string): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=permissions.middleware.d.ts.map