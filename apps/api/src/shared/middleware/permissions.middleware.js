"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireModuleAccess = requireModuleAccess;
exports.requireOwnership = requireOwnership;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Middleware para verificar que el usuario tiene rol específico
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado',
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para acceder a este recurso',
                requiredRole: allowedRoles,
                yourRole: req.user.role,
            });
        }
        next();
    };
}
/**
 * Middleware para verificar permisos sobre un módulo específico
 */
function requireModuleAccess(module, action = 'VIEW') {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado',
            });
        }
        // ADMIN tiene acceso a todo
        if (req.user.role === 'ADMIN') {
            return next();
        }
        try {
            // Buscar permiso del usuario sobre el módulo
            const permission = await prisma.userPermission.findUnique({
                where: {
                    userId_module: {
                        userId: req.user.userId,
                        module,
                    },
                },
            });
            if (!permission) {
                return res.status(403).json({
                    success: false,
                    error: `No tienes permisos para el módulo ${module}`,
                });
            }
            // Verificar acción específica
            let hasPermission = false;
            switch (action) {
                case 'VIEW':
                    hasPermission = permission.canView;
                    break;
                case 'OPERATE':
                    hasPermission = permission.canOperate;
                    break;
                case 'EXPORT':
                    hasPermission = permission.canExport;
                    break;
            }
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: `No tienes permiso para ${action} en el módulo ${module}`,
                });
            }
            next();
        }
        catch (error) {
            console.error('Error verificando permisos:', error);
            res.status(500).json({
                success: false,
                error: 'Error verificando permisos',
            });
        }
    };
}
/**
 * Middleware para verificar que el usuario es dueño del recurso
 */
function requireOwnership(resourceUserIdField = 'createdById') {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado',
            });
        }
        // ADMIN puede acceder a todo
        if (req.user.role === 'ADMIN') {
            return next();
        }
        // Verificar ownership (implementar según necesidad)
        // Por ahora permitir a todos los operadores
        next();
    };
}
//# sourceMappingURL=permissions.middleware.js.map