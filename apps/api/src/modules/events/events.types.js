"use strict";
/**
 * EUFORIA EVENTS - Events Module Types
 * Tipos y constantes específicos del módulo de eventos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VENUE_TYPE = exports.EVENT_TYPE = exports.EVENT_STATUS = void 0;
// Estados posibles de un evento
exports.EVENT_STATUS = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    FINISHED: 'FINISHED',
};
// Tipos de evento
exports.EVENT_TYPE = {
    WEDDING: 'WEDDING',
    BIRTHDAY: 'BIRTHDAY',
    QUINCEANERA: 'QUINCEANERA',
    CORPORATE: 'CORPORATE',
    GRADUATION: 'GRADUATION',
    ANNIVERSARY: 'ANNIVERSARY',
    FIESTA_PRIVADA: 'FIESTA_PRIVADA',
    SHOW: 'SHOW',
    EVENTO_ESPECIAL: 'EVENTO_ESPECIAL',
    OTHER: 'OTHER',
};
// Tipos de venue
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
//# sourceMappingURL=events.types.js.map