"use strict";
/**
 * EUFORIA EVENTS - Error Handler Middleware
 * Manejo centralizado de errores
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const auth_service_1 = require("../../modules/auth/auth.service");
const events_service_1 = require("../../modules/events/events.service");
const venues_service_1 = require("../../modules/venues/venues.service");
const clients_service_1 = require("../../modules/clients/clients.service");
const musicadj_service_1 = require("../../modules/musicadj/musicadj.service");
const spotify_service_1 = require("../../modules/musicadj/spotify.service");
function errorHandler(err, req, res, _next) {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    // Errores de autenticación
    if (err instanceof auth_service_1.AuthError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }
    // Errores de eventos
    if (err instanceof events_service_1.EventError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }
    // Errores de venues
    if (err instanceof venues_service_1.VenueError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }
    // Errores de clients
    if (err instanceof clients_service_1.ClientError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }
    // Errores de MUSICADJ
    if (err instanceof musicadj_service_1.MusicadjError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }
    // Errores de Spotify
    if (err instanceof spotify_service_1.SpotifyError) {
        return res.status(err.statusCode).json({
            error: err.message,
            spotifyAvailable: false,
        });
    }
    // Errores de validación Zod
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    // Errores de Prisma
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            error: 'Error de base de datos',
            message: err.message,
        });
    }
    // Error genérico
    const statusCode = 'statusCode' in err ? err.statusCode : 500;
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : err.message,
    });
}
//# sourceMappingURL=error.middleware.js.map