/**
 * EUFORIA EVENTS - Events Controller
 * Handlers HTTP para gestión de eventos
 */
import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types';
export declare const eventController: {
    /**
     * POST /api/events
     * Crea un nuevo evento
     * Requiere: ADMIN o MANAGER
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/events
     * Lista eventos con filtros
     * Requiere: Autenticado
     */
    findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/events/:id
     * Obtiene un evento por ID
     * Requiere: Autenticado
     */
    findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/events/slug/:slug
     * Obtiene un evento por slug (para acceso público via QR)
     * No requiere auth - Es la entrada del cliente
     */
    findBySlug(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * PATCH /api/events/:id
     * Actualiza datos del evento (venue, client, status)
     * Requiere: ADMIN o MANAGER
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/events/:id/data
     * Actualiza eventData específicamente
     * Requiere: ADMIN o MANAGER
     */
    updateEventData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/events/:id/status
     * Cambia el estado del evento
     * Requiere: ADMIN o MANAGER
     */
    updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/events/:id
     * Elimina un evento (soft delete)
     * Requiere: ADMIN
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/events/:id/duplicate
     * Duplica un evento existente
     * Requiere: ADMIN o MANAGER
     */
    duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/events/:id/qr
     * Obtiene el código QR del evento en múltiples formatos
     * Requiere: Autenticado
     *
     * Query params opcionales:
     * - width: ancho del QR (default 300)
     * - darkColor: color oscuro (default #000000)
     * - lightColor: color claro (default #ffffff)
     */
    getQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/events/:id/qr/download
     * Descarga el código QR como imagen PNG
     * Requiere: Autenticado
     *
     * Query params opcionales:
     * - width: ancho del QR (default 400 para descarga)
     * - darkColor: color oscuro (default #000000)
     * - lightColor: color claro (default #ffffff)
     */
    downloadQR(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/events/:id/qr/preview
     * Sirve el código QR como imagen PNG inline (para preview en browser)
     * Requiere: Autenticado
     */
    previewQR(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=events.controller.d.ts.map