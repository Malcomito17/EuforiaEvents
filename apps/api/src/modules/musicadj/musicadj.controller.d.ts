/**
 * MUSICADJ Controller
 * Handlers HTTP con integración Socket.io y Spotify
 */
import { Request, Response, NextFunction } from 'express';
/**
 * GET /api/events/:eventId/musicadj/config
 */
export declare function getConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/events/:eventId/musicadj/config
 */
export declare function updateConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/musicadj/search
 * Busca tracks en Spotify (público)
 */
export declare function searchSpotify(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/events/:eventId/musicadj/track/:trackId
 * Obtiene info de un track específico
 */
export declare function getSpotifyTrack(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/events/:eventId/musicadj/requests
 */
export declare function createRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/musicadj/requests
 */
export declare function listRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/musicadj/requests/:requestId
 */
export declare function getRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/events/:eventId/musicadj/requests/:requestId
 */
export declare function updateRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/events/:eventId/musicadj/requests/:requestId
 */
export declare function deleteRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/events/:eventId/musicadj/requests/reorder
 */
export declare function reorderQueue(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/events/:eventId/musicadj/stats
 */
export declare function getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=musicadj.controller.d.ts.map