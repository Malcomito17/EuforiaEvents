"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
exports.authController = {
    /**
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/auth/register
     * Requiere autenticación como ADMIN
     */
    async register(req, res, next) {
        try {
            const creatorRole = req.user?.role;
            const user = await auth_service_1.authService.register(req.body, creatorRole);
            res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/auth/me
     * Requiere autenticación
     */
    async me(req, res, next) {
        try {
            if (!req.user?.userId) {
                throw new auth_service_1.AuthError('No autenticado', 401);
            }
            const user = await auth_service_1.authService.getCurrentUser(req.user.userId);
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/auth/change-password
     * Requiere autenticación
     */
    async changePassword(req, res, next) {
        try {
            if (!req.user?.userId) {
                throw new auth_service_1.AuthError('No autenticado', 401);
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new auth_service_1.AuthError('Se requiere contraseña actual y nueva', 400);
            }
            if (newPassword.length < 6) {
                throw new auth_service_1.AuthError('La nueva contraseña debe tener al menos 6 caracteres', 400);
            }
            const result = await auth_service_1.authService.changePassword(req.user.userId, currentPassword, newPassword);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map