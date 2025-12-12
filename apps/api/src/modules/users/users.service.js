"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersError = void 0;
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updateUserPermissions = updateUserPermissions;
exports.deleteUser = deleteUser;
exports.reactivateUser = reactivateUser;
exports.getRolePreset = getRolePreset;
exports.userHasPermission = userHasPermission;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users_types_1 = require("./users.types");
const prisma = new client_1.PrismaClient();
class UsersError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'UsersError';
    }
}
exports.UsersError = UsersError;
// ============================================
// CRUD OPERATIONS
// ============================================
/**
 * Lista usuarios con filtros y paginación
 */
async function listUsers(filters) {
    const { role, isActive, search, includeInactive, limit, offset } = users_types_1.listUsersQuerySchema.parse(filters);
    const where = {};
    if (!includeInactive) {
        where.isActive = true;
    }
    else if (isActive !== undefined) {
        where.isActive = isActive;
    }
    if (role) {
        where.role = role;
    }
    if (search) {
        where.OR = [
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                permissions: {
                    select: {
                        id: true,
                        module: true,
                        canView: true,
                        canEdit: true,
                        canDelete: true,
                        canExport: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.user.count({ where }),
    ]);
    return {
        users,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + users.length < total,
        },
    };
}
/**
 * Obtiene un usuario por ID
 */
async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
                select: {
                    id: true,
                    module: true,
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canExport: true,
                },
            },
        },
    });
    if (!user) {
        throw new UsersError('Usuario no encontrado', 404);
    }
    return user;
}
/**
 * Crea un nuevo usuario
 */
async function createUser(input) {
    const data = users_types_1.createUserSchema.parse(input);
    // Verificar username único
    const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
    });
    if (existingUsername) {
        throw new UsersError('El nombre de usuario ya existe', 409);
    }
    // Verificar email único si se proporciona
    if (data.email) {
        const existingEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new UsersError('El email ya está registrado', 409);
        }
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    // Determinar permisos: usa preset del rol si no se proporcionaron permisos personalizados
    const permissions = data.permissions.length > 0
        ? data.permissions
        : users_types_1.ROLE_PRESETS[data.role];
    // Crear usuario con permisos
    const user = await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            permissions: {
                create: permissions.map(p => ({
                    module: p.module,
                    canView: p.canView,
                    canEdit: p.canEdit,
                    canDelete: p.canDelete,
                    canExport: p.canExport,
                })),
            },
        },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
                select: {
                    id: true,
                    module: true,
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canExport: true,
                },
            },
        },
    });
    console.log(`[USERS] Usuario creado: ${user.id} (${user.username})`);
    return user;
}
/**
 * Actualiza un usuario
 */
async function updateUser(userId, input) {
    const data = users_types_1.updateUserSchema.parse(input);
    // Verificar que existe
    const existing = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!existing) {
        throw new UsersError('Usuario no encontrado', 404);
    }
    // Verificar username único si se cambia
    if (data.username && data.username !== existing.username) {
        const duplicate = await prisma.user.findUnique({
            where: { username: data.username },
        });
        if (duplicate) {
            throw new UsersError('El nombre de usuario ya existe', 409);
        }
    }
    // Verificar email único si se cambia
    if (data.email && data.email !== existing.email) {
        const duplicate = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (duplicate) {
            throw new UsersError('El email ya está registrado', 409);
        }
    }
    // Preparar datos de actualización
    const updateData = {};
    if (data.username)
        updateData.username = data.username;
    if (data.email !== undefined)
        updateData.email = data.email;
    if (data.role)
        updateData.role = data.role;
    if (data.isActive !== undefined)
        updateData.isActive = data.isActive;
    if (data.password) {
        updateData.password = await bcryptjs_1.default.hash(data.password, 10);
    }
    // Actualizar permisos si se proporcionan
    if (data.permissions) {
        // Eliminar permisos existentes
        await prisma.userPermission.deleteMany({
            where: { userId },
        });
        // Crear nuevos permisos
        updateData.permissions = {
            create: data.permissions.map(p => ({
                module: p.module,
                canView: p.canView,
                canEdit: p.canEdit,
                canDelete: p.canDelete,
                canExport: p.canExport,
            })),
        };
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
                select: {
                    id: true,
                    module: true,
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canExport: true,
                },
            },
        },
    });
    console.log(`[USERS] Usuario actualizado: ${user.id}`);
    return user;
}
/**
 * Actualiza solo los permisos de un usuario
 */
async function updateUserPermissions(userId, permissions) {
    const { permissions: validatedPermissions } = users_types_1.updatePermissionsSchema.parse({ permissions });
    const existing = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!existing) {
        throw new UsersError('Usuario no encontrado', 404);
    }
    // Eliminar permisos existentes y crear nuevos en transacción
    await prisma.$transaction([
        prisma.userPermission.deleteMany({
            where: { userId },
        }),
        prisma.user.update({
            where: { id: userId },
            data: {
                permissions: {
                    create: validatedPermissions.map(p => ({
                        module: p.module,
                        canView: p.canView,
                        canEdit: p.canEdit,
                        canDelete: p.canDelete,
                        canExport: p.canExport,
                    })),
                },
            },
        }),
    ]);
    console.log(`[USERS] Permisos actualizados para usuario: ${userId}`);
    return getUserById(userId);
}
/**
 * Elimina un usuario (soft delete)
 */
async function deleteUser(userId) {
    const existing = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!existing) {
        throw new UsersError('Usuario no encontrado', 404);
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: {
            id: true,
            username: true,
            isActive: true,
        },
    });
    console.log(`[USERS] Usuario desactivado: ${user.id}`);
    return { message: 'Usuario desactivado correctamente', user };
}
/**
 * Reactiva un usuario
 */
async function reactivateUser(userId) {
    const existing = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!existing) {
        throw new UsersError('Usuario no encontrado', 404);
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
                select: {
                    id: true,
                    module: true,
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canExport: true,
                },
            },
        },
    });
    console.log(`[USERS] Usuario reactivado: ${user.id}`);
    return user;
}
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Obtiene los permisos preset para un rol
 */
function getRolePreset(role) {
    return users_types_1.ROLE_PRESETS[role] || [];
}
/**
 * Verifica si un usuario tiene un permiso específico
 */
async function userHasPermission(userId, module, action) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { permissions: true },
    });
    if (!user || !user.isActive)
        return false;
    // ADMIN tiene todos los permisos
    if (user.role === 'ADMIN')
        return true;
    const permission = user.permissions.find(p => p.module === module);
    if (!permission)
        return false;
    switch (action) {
        case 'view': return permission.canView;
        case 'edit': return permission.canEdit;
        case 'delete': return permission.canDelete;
        case 'export': return permission.canExport;
        default: return false;
    }
}
//# sourceMappingURL=users.service.js.map