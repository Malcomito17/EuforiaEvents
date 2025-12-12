"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requireModuleAccess = requireModuleAccess;
exports.optionalAuth = optionalAuth;
const auth_service_1 = require("./auth.service");
const database_1 = __importDefault(require("../../config/database"));
/**
 * Middleware que verifica el JWT y agrega user al request
 * Uso: router.get('/ruta', authenticate, handler)
 */
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new auth_service_1.AuthError('Token no proporcionado', 401);
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new auth_service_1.AuthError('Formato de token inválido', 401);
        }
        const payload = auth_service_1.authService.verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof auth_service_1.AuthError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        // Error de JWT (token expirado, inválido, etc.)
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
/**
 * Middleware que verifica el rol del usuario
 * Uso: router.post('/ruta', authenticate, requireRole('ADMIN'), handler)
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
}
/**
 * Middleware que verifica permisos sobre un módulo específico
 * Uso: router.get('/musicadj/:eventId', authenticate, requireModuleAccess('MUSICADJ'), handler)
 */
function requireModuleAccess(module, permission = 'view') {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }
            // ADMIN tiene acceso total
            if (req.user.role === 'ADMIN') {
                return next();
            }
            // Buscar permisos del usuario
            const userPermission = await database_1.default.userPermission.findUnique({
                where: {
                    userId_module: {
                        userId: req.user.userId,
                        module: module,
                    },
                },
            });
            if (!userPermission) {
                return res.status(403).json({
                    error: `No tienes acceso al módulo ${module}`
                });
            }
            // Verificar el tipo de permiso requerido
            const hasPermission = (permission === 'view' && userPermission.canView) ||
                (permission === 'operate' && userPermission.canOperate) ||
                (permission === 'export' && userPermission.canExport);
            if (!hasPermission) {
                return res.status(403).json({
                    error: `No tienes permiso para ${permission} en ${module}`
                });
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
/**
 * Middleware opcional - verifica JWT si existe, pero no falla si no hay token
 * Útil para rutas que funcionan con o sin auth
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }
    try {
        const [type, token] = authHeader.split(' ');
        if (type === 'Bearer' && token) {
            const payload = auth_service_1.authService.verifyToken(token);
            req.user = payload;
        }
    }
    catch {
        // Token inválido, pero continuamos sin user
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map