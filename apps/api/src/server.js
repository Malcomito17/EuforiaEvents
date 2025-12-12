"use strict";
/**
 * EUFORIA EVENTS - Server Entry Point
 * Inicializa Express + Socket.io
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Cargar variables de entorno ANTES de todo
const dotenv_1 = require("dotenv");
const path_1 = require("path");
// Cargar .env desde el working directory (apps/api)
(0, dotenv_1.config)({ path: (0, path_1.resolve)(process.cwd(), '.env') });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./socket");
const PORT = process.env.PORT || 3000;
// Crear servidor HTTP (necesario para Socket.io)
const httpServer = (0, http_1.createServer)(app_1.default);
// Inicializar Socket.io
const io = (0, socket_1.initializeSocket)(httpServer);
// Exponer io en app para uso en controllers/services
app_1.default.set('io', io);
// Iniciar servidor
httpServer.listen(PORT, () => {
    console.log(`🚀 EUFORIA API corriendo en http://localhost:${PORT}`);
    console.log(`🔌 Socket.io habilitado`);
});
// Manejo de errores del servidor
httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} en uso. Ejecuta: lsof -ti:${PORT} | xargs kill -9`);
    }
    else {
        console.error('❌ Error del servidor:', error);
    }
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Señal SIGTERM recibida. Cerrando servidor...');
    httpServer.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map