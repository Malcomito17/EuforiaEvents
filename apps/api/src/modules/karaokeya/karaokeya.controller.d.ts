/**
 * KARAOKEYA Controller
 * Handlers HTTP con búsqueda híbrida (BD + YouTube)
 */
import { Request, Response, NextFunction } from 'express';
/**
 * GET /api/events/:eventId/karaokeya/config
 */
export declare function getConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/events/:eventId/karaokeya/config
 */
export declare function updateConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/search
 * Búsqueda híbrida: BD (3 populares) + YouTube (5 nuevos)
 */
export declare function hybridSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/popular
 * Obtiene canciones populares del catálogo filtradas por evento
 */
export declare function getPopularSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/suggestions
 * Obtiene sugerencias inteligentes basadas en contexto y guest
 */
export declare function getSmartSuggestions(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/events/:eventId/karaokeya/requests
 * Crea una nueva solicitud de karaoke
 */
export declare function createRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/requests
 * Lista solicitudes de un evento
 */
export declare function listRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/guests/:guestId/requests
 * Obtiene solicitudes de un guest específico
 */
export declare function getGuestRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/queue
 * Obtiene la cola pública del evento (solo QUEUED, CALLED, ON_STAGE)
 */
export declare function getPublicQueue(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/requests/:requestId
 * Obtiene una solicitud específica
 */
export declare function getRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/events/:eventId/karaokeya/requests/:requestId
 * Actualiza el estado de una solicitud
 */
export declare function updateRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/events/:eventId/karaokeya/requests/:requestId
 * Elimina una solicitud
 */
export declare function deleteRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/events/:eventId/karaokeya/requests/reorder
 * Reordena la cola
 */
export declare function reorderQueue(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/stats
 * Obtiene estadísticas del módulo
 */
export declare function getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/karaokeya/messages
 * Obtiene mensajes configurables del módulo
 */
export declare function getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSong(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createSong(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateSong(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteSong(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function reactivateSong(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function toggleLike(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getLikeStatus(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getGuestLikedSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getDisplay(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function errorHandler(err: any, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=karaokeya.controller.d.ts.map