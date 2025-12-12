"use strict";
/**
 * KARAOKEYA Service (v1.4)
 * Lógica de negocio para karaoke con búsqueda híbrida (BD + YouTube)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KaraokeyaError = void 0;
exports.getOrCreateConfig = getOrCreateConfig;
exports.updateConfig = updateConfig;
exports.hybridSearch = hybridSearch;
exports.addToCatalog = addToCatalog;
exports.getCatalogSong = getCatalogSong;
exports.getPopularSongs = getPopularSongs;
exports.getSmartSuggestions = getSmartSuggestions;
exports.createRequest = createRequest;
exports.listRequests = listRequests;
exports.getGuestRequests = getGuestRequests;
exports.getPublicQueue = getPublicQueue;
exports.getRequestById = getRequestById;
exports.updateRequestStatus = updateRequestStatus;
exports.deleteRequest = deleteRequest;
exports.reorderQueue = reorderQueue;
exports.getStats = getStats;
exports.listCatalogSongs = listCatalogSongs;
exports.createCatalogSong = createCatalogSong;
exports.updateCatalogSong = updateCatalogSong;
exports.deleteCatalogSong = deleteCatalogSong;
exports.reactivateCatalogSong = reactivateCatalogSong;
exports.toggleSongLike = toggleSongLike;
exports.getSongLikeStatus = getSongLikeStatus;
exports.getGuestLikedSongs = getGuestLikedSongs;
exports.getDisplayData = getDisplayData;
const client_1 = require("@prisma/client");
const youtube_service_1 = require("./youtube.service");
const notifications_service_1 = require("../../shared/services/notifications.service");
const karaokeya_types_1 = require("./karaokeya.types");
const prisma = new client_1.PrismaClient();
// ============================================
// Config Operations
// ============================================
/**
 * Obtiene o crea la configuración del módulo para un evento
 */
async function getOrCreateConfig(eventId) {
    let config = await prisma.karaokeyaConfig.findUnique({
        where: { eventId }
    });
    if (!config) {
        config = await prisma.karaokeyaConfig.create({
            data: { eventId }
        });
        console.log(`[KARAOKEYA] Config creada para evento ${eventId}`);
    }
    return config;
}
/**
 * Actualiza la configuración del módulo
 */
async function updateConfig(eventId, input) {
    // Asegurar que existe
    await getOrCreateConfig(eventId);
    const config = await prisma.karaokeyaConfig.update({
        where: { eventId },
        data: input
    });
    console.log(`[KARAOKEYA] Config actualizada para evento ${eventId}`);
    return config;
}
// ============================================
// Hybrid Search
// ============================================
/**
 * Búsqueda híbrida: primero en BD (3 populares), luego YouTube (5 nuevos)
 */
async function hybridSearch(eventId, query) {
    if (!query.trim()) {
        return { fromCatalog: [], fromYouTube: [], query };
    }
    // 1. Obtener configuración para keywords de YouTube
    const config = await getOrCreateConfig(eventId);
    const youtubeKeywords = config.youtubeSearchKeywords
        ? JSON.parse(config.youtubeSearchKeywords)
        : ['letra', 'lyrics'];
    // 2. Buscar en catálogo (BD)
    const catalogResults = await searchInCatalog(query, 3);
    // 3. Buscar en YouTube (5 resultados) - con manejo de errores
    let filteredYouTubeResults = [];
    try {
        const youtubeResults = await (0, youtube_service_1.searchKaraokeVideos)(query, youtubeKeywords, 5);
        // 4. Filtrar duplicados de YouTube que ya están en el catálogo
        const catalogYoutubeIds = new Set(catalogResults.map(song => song.youtubeId));
        filteredYouTubeResults = youtubeResults.videos.filter(video => !catalogYoutubeIds.has(video.youtubeId));
    }
    catch (error) {
        console.warn('[KARAOKEYA] YouTube search failed, returning catalog only:', error instanceof Error ? error.message : String(error));
    }
    console.log(`[KARAOKEYA] Búsqueda "${query}": ${catalogResults.length} del catálogo, ${filteredYouTubeResults.length} de YouTube`);
    return {
        fromCatalog: catalogResults,
        fromYouTube: filteredYouTubeResults,
        query
    };
}
/**
 * Busca en el catálogo de canciones (BD)
 * Ordena por popularidad (timesRequested DESC)
 */
async function searchInCatalog(query, limit = 3) {
    const songs = await prisma.karaokeSong.findMany({
        where: {
            AND: [
                { isActive: true },
                {
                    OR: [
                        { title: { contains: query } },
                        { artist: { contains: query } }
                    ]
                }
            ]
        },
        orderBy: { timesRequested: 'desc' },
        take: limit
    });
    // Mapear a formato compatible con YouTubeVideo
    return songs.map(song => ({
        catalogId: song.id,
        youtubeId: song.youtubeId,
        title: song.title,
        artist: song.artist,
        youtubeShareUrl: song.youtubeShareUrl,
        thumbnailUrl: song.thumbnailUrl,
        duration: song.duration,
        channelTitle: '',
        timesRequested: song.timesRequested,
        isPopular: true
    }));
}
// ============================================
// Catalog Operations
// ============================================
/**
 * Agrega una canción al catálogo (o incrementa contador si ya existe)
 */
async function addToCatalog(youtubeId, metadata) {
    // 1. Verificar si ya existe
    const existing = await prisma.karaokeSong.findUnique({
        where: { youtubeId }
    });
    if (existing) {
        // Incrementar contador
        await prisma.karaokeSong.update({
            where: { id: existing.id },
            data: { timesRequested: existing.timesRequested + 1 }
        });
        console.log(`[KARAOKEYA] Canción "${existing.title}" ya existe, contador: ${existing.timesRequested + 1}`);
        return existing.id;
    }
    // 2. Si no existe, obtener metadatos de YouTube si no se proveyeron
    let songData = metadata;
    if (!songData) {
        const video = await (0, youtube_service_1.getVideoById)(youtubeId);
        if (!video) {
            throw new KaraokeyaError('Video de YouTube no encontrado', 404);
        }
        songData = {
            title: video.title,
            artist: video.artist,
            youtubeShareUrl: video.youtubeShareUrl,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            language: 'ES'
        };
    }
    // 3. Crear nueva canción
    const song = await prisma.karaokeSong.create({
        data: {
            youtubeId,
            title: songData.title || 'Sin título',
            artist: songData.artist || 'Desconocido',
            youtubeShareUrl: songData.youtubeShareUrl || `https://youtu.be/${youtubeId}`,
            thumbnailUrl: songData.thumbnailUrl,
            duration: songData.duration,
            language: songData.language || 'ES',
            timesRequested: 1 // Inicia en 1
        }
    });
    console.log(`[KARAOKEYA] Nueva canción agregada al catálogo: "${song.title}" - ${song.artist}`);
    return song.id;
}
/**
 * Obtiene una canción del catálogo
 */
async function getCatalogSong(songId) {
    const song = await prisma.karaokeSong.findUnique({
        where: { id: songId },
        include: {
            _count: {
                select: { requests: true, likes: true },
            },
        },
    });
    if (!song) {
        throw new KaraokeyaError('Canción no encontrada', 404);
    }
    return song;
}
/**
 * Lista canciones populares del catálogo filtradas por evento
 */
async function getPopularSongs(eventId, limit = 10) {
    // Obtener los IDs de canciones solicitadas en este evento
    const requestsInEvent = await prisma.karaokeRequest.findMany({
        where: { eventId },
        select: { songId: true },
        distinct: ['songId']
    });
    const songIds = requestsInEvent
        .map(r => r.songId)
        .filter((id) => id !== null);
    if (songIds.length === 0) {
        // Si no hay canciones en este evento, devolver las más populares globalmente
        return await prisma.karaokeSong.findMany({
            where: { isActive: true },
            orderBy: { timesRequested: 'desc' },
            take: limit
        });
    }
    // Obtener canciones populares específicas de este evento
    const songs = await prisma.karaokeSong.findMany({
        where: {
            id: { in: songIds },
            isActive: true
        },
        orderBy: { timesRequested: 'desc' },
        take: limit
    });
    return songs;
}
/**
 * Sugerencias inteligentes basadas en contexto del evento y guest
 * Combina: popularidad en el evento, historial personal, tipo de evento
 */
async function getSmartSuggestions(eventId, guestId, limit = 5) {
    const suggestions = [];
    // 1. Obtener contexto del evento
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { eventData: true }
    });
    const eventType = event?.eventData?.eventType || 'OTHER';
    // 2. Si hay guest, obtener su historial personal (últimas 3 canciones)
    if (guestId) {
        const guestHistory = await prisma.karaokeRequest.findMany({
            where: { guestId, songId: { not: null } },
            include: { song: true },
            orderBy: { createdAt: 'desc' },
            take: 3
        });
        // Agregar canciones similares al historial del guest (mismo artista o género)
        for (const request of guestHistory) {
            if (request.song) {
                const similarSongs = await prisma.karaokeSong.findMany({
                    where: {
                        artist: request.song.artist,
                        id: { not: request.song.id }, // No sugerir la misma canción
                        isActive: true
                    },
                    orderBy: { timesRequested: 'desc' },
                    take: 1
                });
                suggestions.push(...similarSongs.map(s => ({
                    ...s,
                    catalogId: s.id,
                    isPopular: true,
                    timesRequested: s.timesRequested || 0,
                    ranking: s.ranking,
                    difficulty: s.difficulty,
                    opinion: s.opinion,
                    likesCount: s.likesCount,
                    reason: 'similar_to_your_picks'
                })));
            }
        }
    }
    // 3. Canciones populares en eventos del mismo tipo
    const similarEvents = await prisma.event.findMany({
        where: {
            eventData: {
                eventType: eventType
            },
            id: { not: eventId }
        },
        select: { id: true },
        take: 10 // Últimos 10 eventos del mismo tipo
    });
    if (similarEvents.length > 0) {
        const similarEventIds = similarEvents.map(e => e.id);
        // Obtener canciones populares en esos eventos
        const popularInSimilarEvents = await prisma.karaokeRequest.groupBy({
            by: ['songId'],
            where: {
                eventId: { in: similarEventIds },
                songId: { not: null }
            },
            _count: { songId: true },
            orderBy: { _count: { songId: 'desc' } },
            take: 5
        });
        const songIds = popularInSimilarEvents
            .map(r => r.songId)
            .filter((id) => id !== null);
        if (songIds.length > 0) {
            const songs = await prisma.karaokeSong.findMany({
                where: { id: { in: songIds }, isActive: true }
            });
            suggestions.push(...songs.map(s => ({
                ...s,
                catalogId: s.id,
                isPopular: true,
                timesRequested: s.timesRequested || 0,
                ranking: s.ranking,
                difficulty: s.difficulty,
                opinion: s.opinion,
                likesCount: s.likesCount,
                reason: `popular_in_${eventType.toLowerCase()}_events`
            })));
        }
    }
    // 4. Canciones populares en el evento actual
    const eventPopular = await getPopularSongs(eventId, 3);
    suggestions.push(...eventPopular.map(s => ({
        ...s,
        catalogId: s.id,
        isPopular: true,
        timesRequested: s.timesRequested || 0,
        ranking: s.ranking,
        difficulty: s.difficulty,
        opinion: s.opinion,
        likesCount: s.likesCount,
        reason: 'popular_in_this_event'
    })));
    // 5. Trending global (las más solicitadas recientemente en todos los eventos)
    const recentGlobal = await prisma.karaokeRequest.groupBy({
        by: ['songId'],
        where: {
            songId: { not: null },
            createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
            }
        },
        _count: { songId: true },
        orderBy: { _count: { songId: 'desc' } },
        take: 5
    });
    const trendingSongIds = recentGlobal
        .map(r => r.songId)
        .filter((id) => id !== null);
    if (trendingSongIds.length > 0) {
        const trendingSongs = await prisma.karaokeSong.findMany({
            where: { id: { in: trendingSongIds }, isActive: true }
        });
        suggestions.push(...trendingSongs.map(s => ({
            ...s,
            catalogId: s.id,
            isPopular: true,
            timesRequested: s.timesRequested || 0,
            ranking: s.ranking,
            difficulty: s.difficulty,
            opinion: s.opinion,
            likesCount: s.likesCount,
            reason: 'trending_now'
        })));
    }
    // 6. Deduplicar y diversificar (evitar repetir artistas)
    const seenSongIds = new Set();
    const seenArtists = new Set();
    const finalSuggestions = [];
    for (const suggestion of suggestions) {
        // Saltar si ya tenemos esta canción
        if (seenSongIds.has(suggestion.id))
            continue;
        // Saltar si ya tenemos 2+ canciones de este artista (diversidad)
        const artistCount = finalSuggestions.filter(s => s.artist === suggestion.artist).length;
        if (artistCount >= 2)
            continue;
        seenSongIds.add(suggestion.id);
        seenArtists.add(suggestion.artist);
        finalSuggestions.push(suggestion);
        if (finalSuggestions.length >= limit)
            break;
    }
    console.log(`[KARAOKEYA] Smart suggestions generadas: ${finalSuggestions.length} canciones`);
    return finalSuggestions;
}
// ============================================
// Karaoke Request Operations
// ============================================
/**
 * Crea una nueva solicitud de karaoke
 */
async function createRequest(eventId, input) {
    // Verificar que el evento existe y está activo
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { karaokeyaConfig: true }
    });
    if (!event) {
        throw new KaraokeyaError('Evento no encontrado', 404);
    }
    if (event.status !== 'ACTIVE') {
        throw new KaraokeyaError('El evento no está activo', 400);
    }
    // Verificar que el módulo está habilitado
    const config = event.karaokeyaConfig || await getOrCreateConfig(eventId);
    if (!config.enabled) {
        throw new KaraokeyaError('El módulo de karaoke no está habilitado', 400);
    }
    // Verificar que el guest existe
    const guest = await prisma.guest.findUnique({
        where: { id: input.guestId }
    });
    if (!guest) {
        throw new KaraokeyaError('Guest no encontrado', 404);
    }
    // Verificar cooldown
    await checkCooldown(eventId, input.guestId, config.cooldownSeconds);
    // Verificar límite de canciones por persona
    if (config.maxPerPerson > 0) {
        const count = await prisma.karaokeRequest.count({
            where: {
                eventId,
                guestId: input.guestId,
                status: { in: ['QUEUED', 'CALLED', 'ON_STAGE'] }
            }
        });
        if (count >= config.maxPerPerson) {
            throw new KaraokeyaError(`Alcanzaste el límite de ${config.maxPerPerson} canciones por persona`, 429);
        }
    }
    // Determinar songId (agregar al catálogo si viene de YouTube)
    let songId = input.songId;
    if (!songId && input.youtubeId) {
        songId = await addToCatalog(input.youtubeId, {
            title: input.title,
            artist: input.artist
        });
    }
    // Obtener el siguiente número de turno
    const lastRequest = await prisma.karaokeRequest.findFirst({
        where: { eventId },
        orderBy: { turnNumber: 'desc' }
    });
    const turnNumber = (lastRequest?.turnNumber || 0) + 1;
    // Obtener la siguiente posición en cola
    const queuePosition = await getNextQueuePosition(eventId);
    // Crear solicitud
    const request = await prisma.karaokeRequest.create({
        data: {
            eventId,
            guestId: input.guestId,
            songId,
            title: input.title,
            artist: input.artist,
            turnNumber,
            queuePosition,
            status: 'QUEUED'
        },
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    whatsapp: true
                }
            },
            song: true
        }
    });
    console.log(`[KARAOKEYA] Nueva solicitud: "${input.title}" por ${guest.displayName} (turno #${turnNumber})`);
    return request;
}
/**
 * Obtiene la siguiente posición en la cola
 */
async function getNextQueuePosition(eventId) {
    const lastInQueue = await prisma.karaokeRequest.findFirst({
        where: {
            eventId,
            status: { in: ['QUEUED', 'CALLED'] }
        },
        orderBy: { queuePosition: 'desc' }
    });
    return (lastInQueue?.queuePosition || 0) + 1;
}
/**
 * Verifica el cooldown para un guest
 */
async function checkCooldown(eventId, guestId, cooldownSeconds) {
    if (cooldownSeconds === 0)
        return true;
    const cutoffTime = new Date(Date.now() - cooldownSeconds * 1000);
    const recentRequest = await prisma.karaokeRequest.findFirst({
        where: {
            eventId,
            guestId,
            createdAt: {
                gte: cutoffTime
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    if (recentRequest) {
        const remainingSeconds = Math.ceil((recentRequest.createdAt.getTime() + cooldownSeconds * 1000 - Date.now()) / 1000);
        throw new KaraokeyaError(`Debes esperar ${remainingSeconds} segundos antes de pedir otro tema`, 429);
    }
    return true;
}
/**
 * Lista solicitudes de karaoke de un evento
 */
async function listRequests(eventId, status) {
    const where = { eventId };
    if (status) {
        where.status = status;
    }
    const requests = await prisma.karaokeRequest.findMany({
        where,
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    whatsapp: true
                }
            },
            song: true
        },
        orderBy: { queuePosition: 'asc' }
    });
    return requests;
}
/**
 * Obtiene las solicitudes de un guest específico
 */
async function getGuestRequests(eventId, guestId) {
    return await prisma.karaokeRequest.findMany({
        where: {
            eventId,
            guestId
        },
        include: {
            song: true
        },
        orderBy: { createdAt: 'desc' }
    });
}
/**
 * Obtiene la cola pública del evento (solo QUEUED, CALLED, ON_STAGE)
 */
async function getPublicQueue(eventId) {
    return await prisma.karaokeRequest.findMany({
        where: {
            eventId,
            status: {
                in: ['QUEUED', 'CALLED', 'ON_STAGE']
            }
        },
        include: {
            song: true,
            guest: {
                select: {
                    id: true,
                    displayName: true
                }
            }
        },
        orderBy: [
            { queuePosition: 'asc' },
            { createdAt: 'asc' }
        ]
    });
}
/**
 * Obtiene una solicitud específica
 */
async function getRequestById(eventId, requestId) {
    const request = await prisma.karaokeRequest.findFirst({
        where: {
            id: requestId,
            eventId
        },
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    whatsapp: true
                }
            },
            song: true
        }
    });
    if (!request) {
        throw new KaraokeyaError('Solicitud no encontrada', 404);
    }
    return request;
}
/**
 * Actualiza el estado de una solicitud
 */
async function updateRequestStatus(eventId, requestId, status) {
    await getRequestById(eventId, requestId);
    const updateData = { status };
    if (status === 'CALLED') {
        updateData.calledAt = new Date();
    }
    const request = await prisma.karaokeRequest.update({
        where: { id: requestId },
        data: updateData,
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    whatsapp: true
                }
            },
            song: true
        }
    });
    console.log(`[KARAOKEYA] Request ${requestId} actualizado a ${status}`);
    // Enviar notificación por WhatsApp/SMS si el status es CALLED
    // (solo si Twilio está configurado - es opcional)
    if (status === 'CALLED' && request.guest.whatsapp && (0, notifications_service_1.isTwilioConfigured)()) {
        const message = `🎤 ¡Hola ${request.guest.displayName}! Es tu turno de cantar "${request.title}"${request.artist ? ` - ${request.artist}` : ''}. ¡Acercate al escenario! 🎉`;
        // Enviar notificación de forma asíncrona (no bloqueante)
        (0, notifications_service_1.sendNotification)({
            phoneNumber: request.guest.whatsapp,
            message,
            preferWhatsApp: true
        }).catch(error => {
            console.error(`[KARAOKEYA] Error al enviar notificación a ${request.guest.displayName}:`, error);
        });
    }
    return request;
}
/**
 * Elimina una solicitud
 */
async function deleteRequest(eventId, requestId) {
    await getRequestById(eventId, requestId);
    await prisma.karaokeRequest.delete({
        where: { id: requestId }
    });
    console.log(`[KARAOKEYA] Request ${requestId} eliminado`);
    return { success: true };
}
/**
 * Reordena la cola
 */
async function reorderQueue(eventId, requestIds) {
    const updates = requestIds.map((id, index) => prisma.karaokeRequest.update({
        where: { id },
        data: { queuePosition: index + 1 }
    }));
    await prisma.$transaction(updates);
    console.log(`[KARAOKEYA] Cola reordenada: ${requestIds.length} items`);
    return { success: true, order: requestIds };
}
/**
 * Obtiene estadísticas del módulo
 */
async function getStats(eventId) {
    const stats = await prisma.karaokeRequest.groupBy({
        by: ['status'],
        where: { eventId },
        _count: { status: true }
    });
    const total = await prisma.karaokeRequest.count({ where: { eventId } });
    const byStatus = stats.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
    }, {});
    return {
        total,
        queued: byStatus.QUEUED || 0,
        called: byStatus.CALLED || 0,
        onStage: byStatus.ON_STAGE || 0,
        completed: byStatus.COMPLETED || 0,
        noShow: byStatus.NO_SHOW || 0,
        cancelled: byStatus.CANCELLED || 0
    };
}
// ============================================
// CATALOG MANAGEMENT (CRUD)
// ============================================
/**
 * Lista canciones del catálogo con filtros y paginación
 */
async function listCatalogSongs(filters) {
    // Parse and validate query parameters (converts strings to proper types)
    const parsed = karaokeya_types_1.listSongsQuerySchema.parse(filters);
    const { search, difficulty, minRanking, language, sortBy, sortOrder, includeInactive, limit, offset, } = parsed;
    const where = {};
    if (!includeInactive) {
        where.isActive = true;
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { artist: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (difficulty) {
        where.difficulty = difficulty;
    }
    if (minRanking) {
        where.ranking = { gte: minRanking };
    }
    if (language) {
        where.language = language;
    }
    const orderBy = {};
    orderBy[sortBy] = sortOrder;
    const [songs, total] = await Promise.all([
        prisma.karaokeSong.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            include: {
                _count: {
                    select: { requests: true, likes: true },
                },
            },
        }),
        prisma.karaokeSong.count({ where }),
    ]);
    return {
        songs,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + songs.length < total,
        },
    };
}
/**
 * Crea una nueva canción en el catálogo
 */
async function createCatalogSong(input) {
    // Verificar que no exista el youtubeId
    const existing = await prisma.karaokeSong.findUnique({
        where: { youtubeId: input.youtubeId },
    });
    if (existing) {
        throw new KaraokeyaError('Ya existe una canción con ese YouTube ID', 409);
    }
    // Auto-generar youtubeShareUrl si no se proporciona
    if (!input.youtubeShareUrl) {
        input.youtubeShareUrl = `https://youtu.be/${input.youtubeId}`;
    }
    const song = await prisma.karaokeSong.create({
        data: input,
    });
    console.log(`[KARAOKEYA] Canción creada: ${song.id} (${song.title})`);
    return song;
}
/**
 * Actualiza una canción del catálogo
 */
async function updateCatalogSong(songId, input) {
    // Verificar que existe
    const existing = await prisma.karaokeSong.findUnique({
        where: { id: songId },
    });
    if (!existing) {
        throw new KaraokeyaError('Canción no encontrada', 404);
    }
    // Si se cambia youtubeId, verificar que no exista
    if (input.youtubeId && input.youtubeId !== existing.youtubeId) {
        const duplicate = await prisma.karaokeSong.findUnique({
            where: { youtubeId: input.youtubeId },
        });
        if (duplicate) {
            throw new KaraokeyaError('Ya existe una canción con ese YouTube ID', 409);
        }
    }
    const song = await prisma.karaokeSong.update({
        where: { id: songId },
        data: input,
    });
    console.log(`[KARAOKEYA] Canción actualizada: ${song.id}`);
    return song;
}
/**
 * Soft delete de una canción
 */
async function deleteCatalogSong(songId) {
    const existing = await prisma.karaokeSong.findUnique({
        where: { id: songId },
    });
    if (!existing) {
        throw new KaraokeyaError('Canción no encontrada', 404);
    }
    const song = await prisma.karaokeSong.update({
        where: { id: songId },
        data: { isActive: false },
    });
    console.log(`[KARAOKEYA] Canción desactivada: ${song.id}`);
    return { message: 'Canción desactivada correctamente', song };
}
/**
 * Reactivar una canción
 */
async function reactivateCatalogSong(songId) {
    const existing = await prisma.karaokeSong.findUnique({
        where: { id: songId },
    });
    if (!existing) {
        throw new KaraokeyaError('Canción no encontrada', 404);
    }
    const song = await prisma.karaokeSong.update({
        where: { id: songId },
        data: { isActive: true },
    });
    console.log(`[KARAOKEYA] Canción reactivada: ${song.id}`);
    return song;
}
// ============================================
// LIKE SYSTEM
// ============================================
/**
 * Toggle like (idempotente): si existe lo elimina, si no existe lo crea
 * Actualiza el contador likesCount
 */
async function toggleSongLike(songId, guestId) {
    // Verificar que exista la canción
    const song = await prisma.karaokeSong.findUnique({
        where: { id: songId },
    });
    if (!song) {
        throw new KaraokeyaError('Canción no encontrada', 404);
    }
    // Verificar que exista el guest
    const guest = await prisma.guest.findUnique({
        where: { id: guestId },
    });
    if (!guest) {
        throw new KaraokeyaError('Invitado no encontrado', 404);
    }
    // Buscar like existente
    const existingLike = await prisma.karaokeSongLike.findUnique({
        where: {
            songId_guestId: { songId, guestId },
        },
    });
    let liked;
    let likesCount;
    if (existingLike) {
        // UNLIKE: Eliminar el like y decrementar contador
        await prisma.$transaction([
            prisma.karaokeSongLike.delete({
                where: { id: existingLike.id },
            }),
            prisma.karaokeSong.update({
                where: { id: songId },
                data: { likesCount: { decrement: 1 } },
            }),
        ]);
        liked = false;
        likesCount = Math.max(0, song.likesCount - 1);
        console.log(`[KARAOKEYA] Unlike: ${guestId} → ${songId}`);
    }
    else {
        // LIKE: Crear el like e incrementar contador
        await prisma.$transaction([
            prisma.karaokeSongLike.create({
                data: { songId, guestId },
            }),
            prisma.karaokeSong.update({
                where: { id: songId },
                data: { likesCount: { increment: 1 } },
            }),
        ]);
        liked = true;
        likesCount = song.likesCount + 1;
        console.log(`[KARAOKEYA] Like: ${guestId} → ${songId}`);
    }
    return {
        liked,
        likesCount,
    };
}
/**
 * Obtiene el estado de like de un guest para una canción
 */
async function getSongLikeStatus(songId, guestId) {
    const like = await prisma.karaokeSongLike.findUnique({
        where: {
            songId_guestId: { songId, guestId },
        },
    });
    return {
        liked: !!like,
    };
}
/**
 * Obtiene todas las canciones que le gustaron a un guest
 */
async function getGuestLikedSongs(guestId, limit = 50) {
    const likes = await prisma.karaokeSongLike.findMany({
        where: { guestId },
        include: {
            song: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
    return {
        songs: likes.map((like) => like.song),
        total: likes.length,
    };
}
// ============================================
// DISPLAY SCREEN (Pantalla pública)
// ============================================
/**
 * Obtiene todos los datos necesarios para el Display Screen público
 * Usado por la pantalla grande de karaoke en el evento
 */
async function getDisplayData(eventSlug) {
    // Buscar evento por slug
    const event = await prisma.event.findUnique({
        where: { slug: eventSlug },
        include: {
            eventData: true,
            venue: true,
        },
    });
    if (!event) {
        throw new KaraokeyaError('Evento no encontrado', 404);
    }
    // Obtener configuración de karaokeya
    const config = await getOrCreateConfig(event.id);
    // Obtener requests según el estado (solo mostrar QUEUED, CALLED, ON_STAGE)
    const allRequests = await prisma.karaokeRequest.findMany({
        where: {
            eventId: event.id,
            status: {
                in: ['QUEUED', 'CALLED', 'ON_STAGE'],
            },
        },
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                },
            },
            song: {
                select: {
                    thumbnailUrl: true,
                    youtubeShareUrl: true,
                },
            },
        },
        orderBy: { queuePosition: 'asc' },
    });
    // Separar por estado
    const onStage = allRequests.find((r) => r.status === 'ON_STAGE') || null;
    const called = allRequests.find((r) => r.status === 'CALLED') || null;
    const queued = allRequests.filter((r) => r.status === 'QUEUED');
    return {
        event: {
            id: event.id,
            slug: event.slug,
            eventName: event.eventData?.eventName || 'Evento',
            eventDate: event.eventData?.eventDate || event.createdAt,
            location: event.venue?.name || 'Venue',
        },
        config: {
            displayMode: config.displayMode,
            displayLayout: config.displayLayout,
            displayBreakMessage: config.displayBreakMessage,
            displayStartMessage: config.displayStartMessage,
            displayPromoImageUrl: config.displayPromoImageUrl,
        },
        queue: {
            onStage,
            called,
            next: queued[0] || null,
            upcoming: queued.slice(1, 10), // Mostrar hasta 9 más en cola
            total: queued.length,
        },
    };
}
// ============================================
// Error Class
// ============================================
class KaraokeyaError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'KaraokeyaError';
    }
}
exports.KaraokeyaError = KaraokeyaError;
//# sourceMappingURL=karaokeya.service.js.map