"use strict";
/**
 * EUFORIA EVENTS - Venues Controller
 * Handlers HTTP para gestión de venues
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueController = void 0;
const venues_service_1 = require("./venues.service");
exports.venueController = {
    /**
     * POST /api/venues
     * Crea un nuevo venue
     */
    async create(req, res, next) {
        try {
            const venue = await venues_service_1.venueService.create(req.body);
            res.status(201).json(venue);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/venues
     * Lista venues con filtros
     */
    async findAll(req, res, next) {
        try {
            const result = await venues_service_1.venueService.findAll(req.query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/venues/:id
     * Obtiene un venue por ID
     */
    async findById(req, res, next) {
        try {
            const venue = await venues_service_1.venueService.findById(req.params.id);
            res.json(venue);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/venues/:id
     * Actualiza un venue
     */
    async update(req, res, next) {
        try {
            const venue = await venues_service_1.venueService.update(req.params.id, req.body);
            res.json(venue);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/venues/:id
     * Desactiva un venue (soft delete)
     */
    async delete(req, res, next) {
        try {
            const result = await venues_service_1.venueService.delete(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/venues/:id/reactivate
     * Reactiva un venue desactivado
     */
    async reactivate(req, res, next) {
        try {
            const result = await venues_service_1.venueService.reactivate(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=venues.controller.js.map