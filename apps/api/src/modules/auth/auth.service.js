"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthError = exports.registerSchema = exports.loginSchema = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const password_1 = require("../../shared/utils/password");
// Schemas de validación
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Username debe tener al menos 3 caracteres'),
    password: zod_1.z.string().min(6, 'Password debe tener al menos 6 caracteres'),
});
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).max(100),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'OPERATOR']).default('OPERATOR'),
});
class AuthService {
    /**
     * Genera un JWT para el usuario
     */
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
    }
    /**
     * Verifica y decodifica un JWT
     */
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    /**
     * Login de usuario
     */
    async login(input) {
        const { username, password } = exports.loginSchema.parse(input);
        const user = await database_1.default.user.findUnique({
            where: { username },
            include: { permissions: true },
        });
        if (!user) {
            throw new AuthError('Credenciales inválidas', 401);
        }
        if (!user.isActive) {
            throw new AuthError('Usuario desactivado', 403);
        }
        const isValid = await (0, password_1.verifyPassword)(password, user.password);
        if (!isValid) {
            throw new AuthError('Credenciales inválidas', 401);
        }
        const token = this.generateToken({
            userId: user.id,
            username: user.username,
            role: user.role,
        });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            },
        };
    }
    /**
     * Registro de nuevo usuario (solo admin puede crear)
     */
    async register(input, creatorRole) {
        // Solo ADMIN puede crear usuarios
        if (creatorRole && creatorRole !== 'ADMIN') {
            throw new AuthError('Solo administradores pueden crear usuarios', 403);
        }
        const { username, email, password, role } = exports.registerSchema.parse(input);
        // Verificar username único
        const existingUser = await database_1.default.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            throw new AuthError('El username ya existe', 409);
        }
        // Verificar email único si se proporciona
        if (email) {
            const existingEmail = await database_1.default.user.findUnique({
                where: { email },
            });
            if (existingEmail) {
                throw new AuthError('El email ya está registrado', 409);
            }
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const user = await database_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        return user;
    }
    /**
     * Obtiene el usuario actual por ID
     */
    async getCurrentUser(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { permissions: true },
        });
        if (!user) {
            throw new AuthError('Usuario no encontrado', 404);
        }
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            permissions: user.permissions,
            createdAt: user.createdAt,
        };
    }
    /**
     * Cambia la contraseña del usuario
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new AuthError('Usuario no encontrado', 404);
        }
        const isValid = await (0, password_1.verifyPassword)(currentPassword, user.password);
        if (!isValid) {
            throw new AuthError('Contraseña actual incorrecta', 401);
        }
        const hashedPassword = await (0, password_1.hashPassword)(newPassword);
        await database_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Contraseña actualizada correctamente' };
    }
}
// Custom error para auth
class AuthError extends Error {
    statusCode;
    constructor(message, statusCode = 401) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map