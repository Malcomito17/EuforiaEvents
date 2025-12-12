/**
 * EUFORIA EVENTS - Clients Controller
 * Handlers HTTP para gestión de clientes
 */
import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types';
export declare const clientController: {
    /**
     * POST /api/clients
     * Crea un nuevo cliente
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/clients
     * Lista clientes con filtros
     */
    findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/clients/:id
     * Obtiene un cliente por ID
     */
    findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/clients/:id
     * Actualiza un cliente
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/clients/:id
     * Desactiva un cliente (soft delete)
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/clients/:id/reactivate
     * Reactiva un cliente desactivado
     */
    reactivate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=clients.controller.d.ts.map