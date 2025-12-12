"use strict";
/**
 * EUFORIA EVENTS - Venues Service
 * Lógica de negocio para gestión de venues (salones/lugares)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueService = exports.VenueError = exports.venueFiltersSchema = exports.updateVenueSchema = exports.createVenueSchema = exports.VENUE_TYPE = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
// ============================================
// CONSTANTES
// ============================================
exports.VENUE_TYPE = {
    SALON: 'SALON',
    HOTEL: 'HOTEL',
    QUINTA: 'QUINTA',
    RESTAURANT: 'RESTAURANT',
    BAR: 'BAR',
    PUB: 'PUB',
    DISCO: 'DISCO',
    CONFITERIA: 'CONFITERIA',
    CLUB: 'CLUB',
    OUTDOOR: 'OUTDOOR',
    OTHER: 'OTHER',
};
// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================
exports.createVenueSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
    type: zod_1.z.enum([
        exports.VENUE_TYPE.SALON,
        exports.VENUE_TYPE.HOTEL,
        exports.VENUE_TYPE.QUINTA,
        exports.VENUE_TYPE.RESTAURANT,
        exports.VENUE_TYPE.BAR,
        exports.VENUE_TYPE.PUB,
        exports.VENUE_TYPE.DISCO,
        exports.VENUE_TYPE.CONFITERIA,
        exports.VENUE_TYPE.CLUB,
        exports.VENUE_TYPE.OUTDOOR,
        exports.VENUE_TYPE.OTHER,
    ]).default(exports.VENUE_TYPE.OTHER),
    address: zod_1.z.string().max(200).optional().nullable(),
    city: zod_1.z.string().max(100).optional().nullable(),
    capacity: zod_1.z.number().int().positive().optional().nullable(),
    contactName: zod_1.z.string().max(100).optional().nullable(),
    contactPhone: zod_1.z.string().max(50).optional().nullable(),
    instagramUrl: zod_1.z.string().url().optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
});
exports.updateVenueSchema = exports.createVenueSchema.partial();
exports.venueFiltersSchema = zod_1.z.object({
    type: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    includeInactive: zod_1.z.coerce.boolean().default(false),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
// ============================================
// ERROR PERSONALIZADO
// ============================================
class VenueError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'VenueError';
    }
}
exports.VenueError = VenueError;
// ============================================
// SERVICIO
// ============================================
class VenueService {
    /**
     * Crea un nuevo venue
     */
    async create(input) {
        const data = exports.createVenueSchema.parse(input);
        const venue = await database_1.default.venue.create({
            data,
        });
        console.log(`[VENUES] Venue creado: ${venue.id} (${venue.name})`);
        return venue;
    }
    /**
     * Obtiene un venue por ID
     */
    async findById(id) {
        const venue = await database_1.default.venue.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { events: true },
                },
            },
        });
        if (!venue) {
            throw new VenueError('Venue no encontrado', 404);
        }
        return venue;
    }
    /**
     * Lista venues con filtros
     */
    async findAll(filters) {
        const { type, city, search, includeInactive, limit, offset } = exports.venueFiltersSchema.parse(filters);
        const where = {};
        // Por defecto solo activos
        if (!includeInactive) {
            where.isActive = true;
        }
        if (type)
            where.type = type;
        if (city)
            where.city = { contains: city };
        if (search)
            where.name = { contains: search };
        const [venues, total] = await Promise.all([
            database_1.default.venue.findMany({
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
            database_1.default.venue.count({ where }),
        ]);
        return {
            venues,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + venues.length < total,
            },
        };
    }
    /**
     * Actualiza un venue
     */
    async update(id, input) {
        const data = exports.updateVenueSchema.parse(input);
        // Verificar que existe
        await this.findById(id);
        const venue = await database_1.default.venue.update({
            where: { id },
            data,
        });
        console.log(`[VENUES] Venue actualizado: ${venue.id}`);
        return venue;
    }
    /**
     * Desactiva un venue (soft delete)
     */
    async delete(id) {
        const venue = await this.findById(id);
        // Verificar si tiene eventos activos
        const activeEvents = await database_1.default.event.count({
            where: {
                venueId: id,
                status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] },
            },
        });
        if (activeEvents > 0) {
            throw new VenueError(`No se puede desactivar: tiene ${activeEvents} evento(s) activo(s)`, 400);
        }
        await database_1.default.venue.update({
            where: { id },
            data: { isActive: false },
        });
        console.log(`[VENUES] Venue desactivado: ${id}`);
        return { message: 'Venue desactivado correctamente' };
    }
    /**
     * Reactiva un venue
     */
    async reactivate(id) {
        const venue = await database_1.default.venue.findUnique({ where: { id } });
        if (!venue) {
            throw new VenueError('Venue no encontrado', 404);
        }
        if (venue.isActive) {
            throw new VenueError('El venue ya está activo', 400);
        }
        await database_1.default.venue.update({
            where: { id },
            data: { isActive: true },
        });
        console.log(`[VENUES] Venue reactivado: ${id}`);
        return { message: 'Venue reactivado correctamente' };
    }
}
exports.venueService = new VenueService();
//# sourceMappingURL=venues.service.js.map