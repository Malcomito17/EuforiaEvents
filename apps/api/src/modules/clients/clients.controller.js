"use strict";
/**
 * EUFORIA EVENTS - Clients Controller
 * Handlers HTTP para gestión de clientes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientController = void 0;
const clients_service_1 = require("./clients.service");
exports.clientController = {
    /**
     * POST /api/clients
     * Crea un nuevo cliente
     */
    async create(req, res, next) {
        try {
            const client = await clients_service_1.clientService.create(req.body);
            res.status(201).json(client);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/clients
     * Lista clientes con filtros
     */
    async findAll(req, res, next) {
        try {
            const result = await clients_service_1.clientService.findAll(req.query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/clients/:id
     * Obtiene un cliente por ID
     */
    async findById(req, res, next) {
        try {
            const client = await clients_service_1.clientService.findById(req.params.id);
            res.json(client);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/clients/:id
     * Actualiza un cliente
     */
    async update(req, res, next) {
        try {
            const client = await clients_service_1.clientService.update(req.params.id, req.body);
            res.json(client);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/clients/:id
     * Desactiva un cliente (soft delete)
     */
    async delete(req, res, next) {
        try {
            const result = await clients_service_1.clientService.delete(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/clients/:id/reactivate
     * Reactiva un cliente desactivado
     */
    async reactivate(req, res, next) {
        try {
            const result = await clients_service_1.clientService.reactivate(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=clients.controller.js.map