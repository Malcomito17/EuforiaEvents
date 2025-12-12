"use strict";
/**
 * EUFORIA EVENTS - Events Service
 * Lógica de negocio para gestión de eventos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventService = exports.EventError = exports.eventFiltersSchema = exports.updateEventDataSchema = exports.updateEventSchema = exports.createEventSchema = exports.createEventDataSchema = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const events_types_1 = require("./events.types");
// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================
exports.createEventDataSchema = zod_1.z.object({
    eventName: zod_1.z.string().min(3, 'Nombre del evento debe tener al menos 3 caracteres').max(100),
    eventType: zod_1.z.enum([
        events_types_1.EVENT_TYPE.WEDDING,
        events_types_1.EVENT_TYPE.BIRTHDAY,
        events_types_1.EVENT_TYPE.QUINCEANERA,
        events_types_1.EVENT_TYPE.CORPORATE,
        events_types_1.EVENT_TYPE.GRADUATION,
        events_types_1.EVENT_TYPE.ANNIVERSARY,
        events_types_1.EVENT_TYPE.FIESTA_PRIVADA,
        events_types_1.EVENT_TYPE.SHOW,
        events_types_1.EVENT_TYPE.EVENTO_ESPECIAL,
        events_types_1.EVENT_TYPE.OTHER,
    ]).default(events_types_1.EVENT_TYPE.OTHER),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date().optional().nullable(),
    guestCount: zod_1.z.number().int().positive().optional().nullable(),
    instagramUrl: zod_1.z.string().url().optional().nullable(),
    instagramUser: zod_1.z.string().max(50).optional().nullable(),
    hashtag: zod_1.z.string().max(50).optional().nullable(),
    spotifyPlaylist: zod_1.z.string().url().optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
    // Colores personalizados (formato hex #RRGGBB)
    primaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser formato hex (#RRGGBB)').optional(),
    secondaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser formato hex (#RRGGBB)').optional(),
    accentColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser formato hex (#RRGGBB)').optional(),
});
exports.createEventSchema = zod_1.z.object({
    venueId: zod_1.z.string().cuid().optional().nullable(),
    clientId: zod_1.z.string().cuid().optional().nullable(),
    eventData: exports.createEventDataSchema,
});
exports.updateEventSchema = zod_1.z.object({
    venueId: zod_1.z.string().cuid().optional().nullable(),
    clientId: zod_1.z.string().cuid().optional().nullable(),
    status: zod_1.z.enum([
        events_types_1.EVENT_STATUS.DRAFT,
        events_types_1.EVENT_STATUS.ACTIVE,
        events_types_1.EVENT_STATUS.PAUSED,
        events_types_1.EVENT_STATUS.FINISHED,
    ]).optional(),
});
exports.updateEventDataSchema = exports.createEventDataSchema.partial();
exports.eventFiltersSchema = zod_1.z.object({
    status: zod_1.z.enum([
        events_types_1.EVENT_STATUS.DRAFT,
        events_types_1.EVENT_STATUS.ACTIVE,
        events_types_1.EVENT_STATUS.PAUSED,
        events_types_1.EVENT_STATUS.FINISHED,
    ]).optional(),
    eventType: zod_1.z.string().optional(),
    venueId: zod_1.z.string().cuid().optional(),
    clientId: zod_1.z.string().cuid().optional(),
    fromDate: zod_1.z.coerce.date().optional(),
    toDate: zod_1.z.coerce.date().optional(),
    search: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
// ============================================
// ERROR PERSONALIZADO
// ============================================
class EventError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'EventError';
    }
}
exports.EventError = EventError;
// ============================================
// UTILIDADES
// ============================================
/**
 * Genera un slug único para el evento
 * Formato: nombre-tipo-MMYY (ej: martina-15-0125)
 */
function generateSlug(eventName, startDate) {
    const namePart = eventName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 20);
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const year = String(startDate.getFullYear()).slice(-2);
    return `${namePart}-${month}${year}`;
}
/**
 * Genera un slug único verificando en BD
 */
async function generateUniqueSlug(eventName, startDate) {
    const baseSlug = generateSlug(eventName, startDate);
    let slug = baseSlug;
    let counter = 1;
    while (await database_1.default.event.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        if (counter > 100) {
            throw new EventError('No se pudo generar slug único', 500);
        }
    }
    return slug;
}
// ============================================
// SERVICIO
// ============================================
class EventService {
    /**
     * Crea un nuevo evento con sus datos
     */
    async create(input, userId) {
        const data = exports.createEventSchema.parse(input);
        // Validar que startDate sea futura (opcional, depende del caso de uso)
        // if (data.eventData.startDate < new Date()) {
        //   throw new EventError('La fecha de inicio debe ser futura', 400)
        // }
        // Validar venue si se proporciona
        if (data.venueId) {
            const venue = await database_1.default.venue.findUnique({ where: { id: data.venueId } });
            if (!venue || !venue.isActive) {
                throw new EventError('Venue no encontrado o inactivo', 404);
            }
        }
        // Validar client si se proporciona
        if (data.clientId) {
            const client = await database_1.default.client.findUnique({ where: { id: data.clientId } });
            if (!client || !client.isActive) {
                throw new EventError('Cliente no encontrado o inactivo', 404);
            }
        }
        // Generar slug único
        const slug = await generateUniqueSlug(data.eventData.eventName, data.eventData.startDate);
        // Crear evento con datos en transacción
        const event = await database_1.default.event.create({
            data: {
                slug,
                status: events_types_1.EVENT_STATUS.DRAFT,
                venueId: data.venueId,
                clientId: data.clientId,
                createdById: userId,
                eventData: {
                    create: data.eventData,
                },
            },
            include: this.getIncludeClause(),
        });
        console.log(`[EVENTS] Evento creado: ${event.id} (${slug}) por usuario ${userId}`);
        return event;
    }
    /**
     * Obtiene un evento por ID con todos sus datos
     */
    async findById(id) {
        const event = await database_1.default.event.findUnique({
            where: { id },
            include: this.getIncludeClause(),
        });
        if (!event) {
            throw new EventError('Evento no encontrado', 404);
        }
        return event;
    }
    /**
     * Obtiene un evento por slug (para acceso público via QR)
     */
    async findBySlug(slug) {
        const event = await database_1.default.event.findUnique({
            where: { slug },
            include: this.getIncludeClause(),
        });
        if (!event) {
            throw new EventError('Evento no encontrado', 404);
        }
        return event;
    }
    /**
     * Lista eventos con filtros
     */
    async findAll(filters) {
        const { status, eventType, venueId, clientId, fromDate, toDate, search, limit, offset, } = exports.eventFiltersSchema.parse(filters);
        const where = {};
        if (status)
            where.status = status;
        if (venueId)
            where.venueId = venueId;
        if (clientId)
            where.clientId = clientId;
        // Filtros en eventData
        if (eventType || fromDate || toDate || search) {
            where.eventData = {};
            if (eventType)
                where.eventData.eventType = eventType;
            if (fromDate)
                where.eventData.startDate = { gte: fromDate };
            if (toDate) {
                where.eventData.startDate = {
                    ...where.eventData.startDate,
                    lte: toDate,
                };
            }
            if (search) {
                where.eventData.eventName = { contains: search };
            }
        }
        const [events, total] = await Promise.all([
            database_1.default.event.findMany({
                where,
                include: {
                    eventData: {
                        select: {
                            eventName: true,
                            eventType: true,
                            startDate: true,
                        },
                    },
                    venue: {
                        select: {
                            name: true,
                            city: true,
                        },
                    },
                    client: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: [
                    { eventData: { startDate: 'desc' } },
                ],
                take: limit,
                skip: offset,
            }),
            database_1.default.event.count({ where }),
        ]);
        return {
            events,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + events.length < total,
            },
        };
    }
    /**
     * Actualiza datos del evento (no eventData)
     */
    async update(id, input) {
        const data = exports.updateEventSchema.parse(input);
        // Verificar que existe
        await this.findById(id);
        // Validar venue si se cambia
        if (data.venueId) {
            const venue = await database_1.default.venue.findUnique({ where: { id: data.venueId } });
            if (!venue || !venue.isActive) {
                throw new EventError('Venue no encontrado o inactivo', 404);
            }
        }
        // Validar client si se cambia
        if (data.clientId) {
            const client = await database_1.default.client.findUnique({ where: { id: data.clientId } });
            if (!client || !client.isActive) {
                throw new EventError('Cliente no encontrado o inactivo', 404);
            }
        }
        const event = await database_1.default.event.update({
            where: { id },
            data,
            include: this.getIncludeClause(),
        });
        console.log(`[EVENTS] Evento actualizado: ${event.id}`);
        return event;
    }
    /**
     * Actualiza eventData específicamente
     */
    async updateEventData(eventId, input) {
        const data = exports.updateEventDataSchema.parse(input);
        // Verificar que existe
        await this.findById(eventId);
        const eventData = await database_1.default.eventData.update({
            where: { eventId },
            data,
        });
        console.log(`[EVENTS] EventData actualizado para evento: ${eventId}`);
        return eventData;
    }
    /**
     * Cambia el estado del evento
     */
    async updateStatus(id, status) {
        const event = await this.findById(id);
        // Validar transiciones de estado
        this.validateStatusTransition(event.status, status);
        const updated = await database_1.default.event.update({
            where: { id },
            data: { status },
            include: this.getIncludeClause(),
        });
        console.log(`[EVENTS] Estado cambiado: ${id} (${event.status} → ${status})`);
        return updated;
    }
    /**
     * Elimina un evento (soft delete via status FINISHED)
     */
    async delete(id) {
        await this.findById(id);
        // Opción 1: Soft delete cambiando status
        const event = await database_1.default.event.update({
            where: { id },
            data: { status: events_types_1.EVENT_STATUS.FINISHED },
        });
        console.log(`[EVENTS] Evento finalizado (soft delete): ${id}`);
        return { message: 'Evento finalizado correctamente', event };
    }
    /**
     * Duplica un evento con nueva fecha
     * Copia: venue, client, eventData, configs de módulos
     * NO copia: requests, datos operativos
     */
    async duplicate(id, userId, newStartDate) {
        const source = await this.findById(id);
        if (!source.eventData) {
            throw new EventError('El evento no tiene datos para duplicar', 400);
        }
        const startDate = newStartDate || source.eventData.startDate;
        const newSlug = await generateUniqueSlug(source.eventData.eventName, startDate);
        // Crear nuevo evento con datos copiados
        const newEvent = await database_1.default.$transaction(async (tx) => {
            // 1. Crear evento base
            const event = await tx.event.create({
                data: {
                    slug: newSlug,
                    status: events_types_1.EVENT_STATUS.DRAFT,
                    venueId: source.venueId,
                    clientId: source.clientId,
                    clonedFromId: source.id,
                    createdById: userId,
                    // Copiar eventData
                    eventData: {
                        create: {
                            eventName: `${source.eventData.eventName} (copia)`,
                            eventType: source.eventData.eventType,
                            startDate,
                            endDate: null, // Nueva fecha de fin debe configurarse
                            guestCount: source.eventData.guestCount,
                            instagramUrl: null,
                            instagramUser: source.eventData.instagramUser,
                            hashtag: null,
                            spotifyPlaylist: source.eventData.spotifyPlaylist,
                            notes: source.eventData.notes,
                        },
                    },
                },
            });
            // 2. Copiar config MUSICADJ si existe
            const musicadjConfig = await tx.musicadjConfig.findUnique({
                where: { eventId: source.id },
            });
            if (musicadjConfig) {
                await tx.musicadjConfig.create({
                    data: {
                        eventId: event.id,
                        enabled: musicadjConfig.enabled,
                        cooldownSeconds: musicadjConfig.cooldownSeconds,
                        allowWithoutSpotify: musicadjConfig.allowWithoutSpotify,
                        welcomeMessage: musicadjConfig.welcomeMessage,
                        showQueueToClient: musicadjConfig.showQueueToClient,
                    },
                });
            }
            // 3. Copiar config KARAOKEYA si existe
            const karaokeyaConfig = await tx.karaokeyaConfig.findUnique({
                where: { eventId: source.id },
            });
            if (karaokeyaConfig) {
                await tx.karaokeyaConfig.create({
                    data: {
                        eventId: event.id,
                        enabled: karaokeyaConfig.enabled,
                        cooldownSeconds: karaokeyaConfig.cooldownSeconds,
                        maxPerPerson: karaokeyaConfig.maxPerPerson,
                        showQueueToClient: karaokeyaConfig.showQueueToClient,
                        showNextSinger: karaokeyaConfig.showNextSinger,
                    },
                });
            }
            return event;
        });
        const result = await this.findById(newEvent.id);
        console.log(`[EVENTS] Evento duplicado: ${source.id} → ${newEvent.id} por usuario ${userId}`);
        return result;
    }
    // ============================================
    // HELPERS PRIVADOS
    // ============================================
    getIncludeClause() {
        return {
            createdBy: {
                select: { id: true, username: true },
            },
            venue: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                    city: true,
                    address: true,
                    contactName: true,
                    contactPhone: true,
                },
            },
            client: {
                select: {
                    id: true,
                    name: true,
                    company: true,
                    phone: true,
                    email: true,
                },
            },
            eventData: true,
            musicadjConfig: true,
            karaokeyaConfig: true,
            clonedFrom: {
                select: { id: true, slug: true },
            },
        };
    }
    validateStatusTransition(from, to) {
        const allowed = {
            DRAFT: ['ACTIVE', 'FINISHED'],
            ACTIVE: ['PAUSED', 'FINISHED'],
            PAUSED: ['ACTIVE', 'FINISHED'],
            FINISHED: [], // No se puede cambiar desde FINISHED
        };
        if (!allowed[from].includes(to)) {
            throw new EventError(`Transición de estado no permitida: ${from} → ${to}`, 400);
        }
    }
}
exports.eventService = new EventService();
//# sourceMappingURL=events.service.js.map