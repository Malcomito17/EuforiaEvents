"use strict";
/**
 * EUFORIA EVENTS - Clients Service
 * Lógica de negocio para gestión de clientes/contratantes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientService = exports.ClientError = exports.clientFiltersSchema = exports.updateClientSchema = exports.createClientSchema = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================
exports.createClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
    company: zod_1.z.string().max(100).optional().nullable(),
    phone: zod_1.z.string().max(50).optional().nullable(),
    email: zod_1.z.string().email('Email inválido').optional().nullable(),
    cuit: zod_1.z.string().max(20).optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
});
exports.updateClientSchema = exports.createClientSchema.partial();
exports.clientFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    includeInactive: zod_1.z.coerce.boolean().default(false),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
// ============================================
// ERROR PERSONALIZADO
// ============================================
class ClientError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ClientError';
    }
}
exports.ClientError = ClientError;
// ============================================
// SERVICIO
// ============================================
class ClientService {
    /**
     * Crea un nuevo cliente
     */
    async create(input) {
        const data = exports.createClientSchema.parse(input);
        // Verificar email único si se proporciona
        if (data.email) {
            const existing = await database_1.default.client.findFirst({
                where: { email: data.email, isActive: true },
            });
            if (existing) {
                throw new ClientError('Ya existe un cliente con ese email', 409);
            }
        }
        // Verificar CUIT único si se proporciona
        if (data.cuit) {
            const existing = await database_1.default.client.findFirst({
                where: { cuit: data.cuit, isActive: true },
            });
            if (existing) {
                throw new ClientError('Ya existe un cliente con ese CUIT', 409);
            }
        }
        const client = await database_1.default.client.create({
            data,
        });
        console.log(`[CLIENTS] Cliente creado: ${client.id} (${client.name})`);
        return client;
    }
    /**
     * Obtiene un cliente por ID
     */
    async findById(id) {
        const client = await database_1.default.client.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { events: true },
                },
            },
        });
        if (!client) {
            throw new ClientError('Cliente no encontrado', 404);
        }
        return client;
    }
    /**
     * Lista clientes con filtros
     */
    async findAll(filters) {
        const { search, includeInactive, limit, offset } = exports.clientFiltersSchema.parse(filters);
        const where = {};
        // Por defecto solo activos
        if (!includeInactive) {
            where.isActive = true;
        }
        // Búsqueda en nombre, empresa o email
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { company: { contains: search } },
                { email: { contains: search } },
            ];
        }
        const [clients, total] = await Promise.all([
            database_1.default.client.findMany({
                where,
                include: {
                    _count: {
                        select: { events: true },
                    },
                },
                orderBy: { name: 'asc' },
                take: limit,
                skip: offset,
            }),
            database_1.default.client.count({ where }),
        ]);
        return {
            clients,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + clients.length < total,
            },
        };
    }
    /**
     * Actualiza un cliente
     */
    async update(id, input) {
        const data = exports.updateClientSchema.parse(input);
        // Verificar que existe
        const existing = await this.findById(id);
        // Verificar email único si se cambia
        if (data.email && data.email !== existing.email) {
            const emailExists = await database_1.default.client.findFirst({
                where: { email: data.email, isActive: true, id: { not: id } },
            });
            if (emailExists) {
                throw new ClientError('Ya existe un cliente con ese email', 409);
            }
        }
        // Verificar CUIT único si se cambia
        if (data.cuit && data.cuit !== existing.cuit) {
            const cuitExists = await database_1.default.client.findFirst({
                where: { cuit: data.cuit, isActive: true, id: { not: id } },
            });
            if (cuitExists) {
                throw new ClientError('Ya existe un cliente con ese CUIT', 409);
            }
        }
        const client = await database_1.default.client.update({
            where: { id },
            data,
        });
        console.log(`[CLIENTS] Cliente actualizado: ${client.id}`);
        return client;
    }
    /**
     * Desactiva un cliente (soft delete)
     */
    async delete(id) {
        await this.findById(id);
        // Verificar si tiene eventos activos
        const activeEvents = await database_1.default.event.count({
            where: {
                clientId: id,
                status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] },
            },
        });
        if (activeEvents > 0) {
            throw new ClientError(`No se puede desactivar: tiene ${activeEvents} evento(s) activo(s)`, 400);
        }
        await database_1.default.client.update({
            where: { id },
            data: { isActive: false },
        });
        console.log(`[CLIENTS] Cliente desactivado: ${id}`);
        return { message: 'Cliente desactivado correctamente' };
    }
    /**
     * Reactiva un cliente
     */
    async reactivate(id) {
        const client = await database_1.default.client.findUnique({ where: { id } });
        if (!client) {
            throw new ClientError('Cliente no encontrado', 404);
        }
        if (client.isActive) {
            throw new ClientError('El cliente ya está activo', 400);
        }
        await database_1.default.client.update({
            where: { id },
            data: { isActive: true },
        });
        console.log(`[CLIENTS] Cliente reactivado: ${id}`);
        return { message: 'Cliente reactivado correctamente' };
    }
}
exports.clientService = new ClientService();
//# sourceMappingURL=clients.service.js.map