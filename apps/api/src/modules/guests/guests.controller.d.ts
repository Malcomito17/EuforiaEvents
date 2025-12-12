import type { Request, Response } from 'express';
export declare class GuestsController {
    /**
     * POST /api/guests/identify
     * Identifica o crea un guest
     */
    identify(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/guests/:guestId
     * Obtiene un guest por ID
     */
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/guests/lookup?email=xxx
     * Busca un guest por email (para autocompletar formularios)
     */
    lookupByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/guests/:guestId/requests
     * Obtiene todos los pedidos de un guest (song + karaoke)
     * Query params: ?eventId=xxx (opcional)
     */
    getRequests(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/guests
     * Lista TODOS los guests (sin filtrar por evento)
     */
    listAll(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/:eventId/guests
     * Lista todos los guests de un evento con contadores de requests
     */
    listByEvent(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/guests/:guestId
     * Elimina un guest y todos sus requests
     */
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const guestsController: GuestsController;
//# sourceMappingURL=guests.controller.d.ts.map