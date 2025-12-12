import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, Role, Module } from '../../shared/types';
/**
 * Middleware que verifica el JWT y agrega user al request
 * Uso: router.get('/ruta', authenticate, handler)
 */
export declare function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
/**
 * Middleware que verifica el rol del usuario
 * Uso: router.post('/ruta', authenticate, requireRole('ADMIN'), handler)
 */
export declare function requireRole(...allowedRoles: Role[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware que verifica permisos sobre un módulo específico
 * Uso: router.get('/musicadj/:eventId', authenticate, requireModuleAccess('MUSICADJ'), handler)
 */
export declare function requireModuleAccess(module: Module, permission?: 'view' | 'operate' | 'export'): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware opcional - verifica JWT si existe, pero no falla si no hay token
 * Útil para rutas que funcionan con o sin auth
 */
export declare function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map