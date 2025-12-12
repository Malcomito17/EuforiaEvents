/**
 * EUFORIA EVENTS - Venues Controller
 * Handlers HTTP para gestión de venues
 */
import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types';
export declare const venueController: {
    /**
     * POST /api/venues
     * Crea un nuevo venue
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/venues
     * Lista venues con filtros
     */
    findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/venues/:id
     * Obtiene un venue por ID
     */
    findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/venues/:id
     * Actualiza un venue
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/venues/:id
     * Desactiva un venue (soft delete)
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/venues/:id/reactivate
     * Reactiva un venue desactivado
     */
    reactivate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=venues.controller.d.ts.map