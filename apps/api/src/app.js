"use strict";
/**
 * EUFORIA EVENTS - Express Application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./modules/auth");
const events_1 = require("./modules/events");
const venues_1 = require("./modules/venues");
const clients_1 = require("./modules/clients");
const musicadj_1 = require("./modules/musicadj");
const karaokeya_1 = require("./modules/karaokeya");
const guests_1 = require("./modules/guests");
const users_1 = require("./modules/users");
const error_middleware_1 = require("./shared/middleware/error.middleware");
const app = (0, express_1.default)();
// Middlewares globales
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API info
app.get('/api', (req, res) => {
    res.json({
        name: 'EUFORIA EVENTS API',
        version: '0.6.0',
        modules: ['auth', 'users', 'events', 'venues', 'clients', 'musicadj', 'karaokeya'],
    });
});
// Rutas de módulos
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/guests', guests_1.guestRoutes);
app.use('/api/users', users_1.usersRoutes);
app.use('/api/events', events_1.eventRoutes);
app.use('/api/venues', venues_1.venueRoutes);
app.use('/api/clients', clients_1.clientRoutes);
// MUSICADJ - rutas anidadas bajo eventos
app.use('/api/events/:eventId/musicadj', musicadj_1.musicadjRoutes);
// KARAOKEYA - rutas anidadas bajo eventos
app.use('/api/events/:eventId/karaokeya', karaokeya_1.karaokeyaRoutes);
// GUESTS - rutas anidadas bajo eventos
app.use('/api/events/:eventId/guests', guests_1.eventGuestRoutes);
// KARAOKEYA - rutas globales (catálogo)
app.use('/api/karaokeya', karaokeya_1.karaokeyaGlobalRoutes);
// Manejo de errores (debe ir al final)
app.use(error_middleware_1.errorHandler);
// 404 para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
exports.default = app;
//# sourceMappingURL=app.js.map