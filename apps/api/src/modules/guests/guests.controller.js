"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestsController = exports.GuestsController = void 0;
const guests_service_1 = require("./guests.service");
const guests_types_1 = require("./guests.types");
class GuestsController {
    /**
     * POST /api/guests/identify
     * Identifica o crea un guest
     */
    async identify(req, res) {
        try {
            const validated = guests_types_1.guestIdentifySchema.parse(req.body);
            const guest = await guests_service_1.guestsService.identify(validated);
            res.status(200).json({
                success: true,
                guest,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    error: 'Datos inválidos',
                    details: error.errors,
                });
            }
            console.error('Error en identify:', error);
            res.status(500).json({
                success: false,
                error: 'Error al identificar guest',
            });
        }
    }
    /**
     * GET /api/guests/:guestId
     * Obtiene un guest por ID
     */
    async getById(req, res) {
        try {
            const { guestId } = req.params;
            const guest = await guests_service_1.guestsService.getById(guestId);
            if (!guest) {
                return res.status(404).json({
                    success: false,
                    error: 'Guest no encontrado',
                });
            }
            res.status(200).json({
                success: true,
                guest,
            });
        }
        catch (error) {
            console.error('Error en getById:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener guest',
            });
        }
    }
    /**
     * GET /api/guests/lookup?email=xxx
     * Busca un guest por email (para autocompletar formularios)
     */
    async lookupByEmail(req, res) {
        try {
            const { email } = req.query;
            if (!email || typeof email !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Email es requerido',
                });
            }
            const guest = await guests_service_1.guestsService.lookupByEmail(email);
            // Retornar success:true incluso si no se encuentra (no es un error)
            res.status(200).json({
                success: true,
                guest: guest || null,
            });
        }
        catch (error) {
            console.error('Error en lookupByEmail:', error);
            res.status(500).json({
                success: false,
                error: 'Error al buscar guest',
            });
        }
    }
    /**
     * GET /api/guests/:guestId/requests
     * Obtiene todos los pedidos de un guest (song + karaoke)
     * Query params: ?eventId=xxx (opcional)
     */
    async getRequests(req, res) {
        try {
            const { guestId } = req.params;
            const { eventId } = req.query;
            const requests = await guests_service_1.guestsService.getRequests(guestId, eventId);
            res.status(200).json({
                success: true,
                requests,
            });
        }
        catch (error) {
            console.error('Error en getRequests:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener pedidos',
            });
        }
    }
    /**
     * GET /api/guests
     * Lista TODOS los guests (sin filtrar por evento)
     */
    async listAll(req, res) {
        try {
            const guests = await guests_service_1.guestsService.listAll();
            res.status(200).json({
                success: true,
                guests,
            });
        }
        catch (error) {
            console.error('Error en listAll:', error);
            res.status(500).json({
                success: false,
                error: 'Error al listar guests',
            });
        }
    }
    /**
     * GET /api/events/:eventId/guests
     * Lista todos los guests de un evento con contadores de requests
     */
    async listByEvent(req, res) {
        try {
            const { eventId } = req.params;
            const guests = await guests_service_1.guestsService.listByEvent(eventId);
            res.status(200).json({
                success: true,
                guests,
            });
        }
        catch (error) {
            console.error('Error en listByEvent:', error);
            res.status(500).json({
                success: false,
                error: 'Error al listar guests',
            });
        }
    }
    /**
     * DELETE /api/guests/:guestId
     * Elimina un guest y todos sus requests
     */
    async delete(req, res) {
        try {
            const { guestId } = req.params;
            const result = await guests_service_1.guestsService.delete(guestId);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            console.error('Error en delete:', error);
            if (error.message === 'Guest no encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }
            res.status(500).json({
                success: false,
                error: 'Error al eliminar guest',
            });
        }
    }
}
exports.GuestsController = GuestsController;
exports.guestsController = new GuestsController();
//# sourceMappingURL=guests.controller.js.map