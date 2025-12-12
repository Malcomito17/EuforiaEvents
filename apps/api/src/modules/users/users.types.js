"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PRESETS = exports.listUsersQuerySchema = exports.updatePermissionsSchema = exports.updateUserSchema = exports.createUserSchema = exports.permissionSchema = exports.MODULES = exports.ROLES = void 0;
const zod_1 = require("zod");
// ============================================
// ENUMS
// ============================================
exports.ROLES = ['ADMIN', 'OPERATOR', 'VIEWER'];
exports.MODULES = ['MUSICADJ', 'KARAOKEYA', 'VENUES', 'EVENTS', 'CLIENTS', 'USERS'];
// ============================================
// SCHEMAS
// ============================================
exports.permissionSchema = zod_1.z.object({
    module: zod_1.z.enum(exports.MODULES),
    canView: zod_1.z.boolean().default(true),
    canEdit: zod_1.z.boolean().default(false),
    canDelete: zod_1.z.boolean().default(false),
    canExport: zod_1.z.boolean().default(false),
});
exports.createUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(exports.ROLES),
    permissions: zod_1.z.array(exports.permissionSchema).optional().default([]),
});
exports.updateUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50).optional(),
    email: zod_1.z.string().email().optional().nullable(),
    password: zod_1.z.string().min(6).optional(),
    role: zod_1.z.enum(exports.ROLES).optional(),
    isActive: zod_1.z.boolean().optional(),
    permissions: zod_1.z.array(exports.permissionSchema).optional(),
});
exports.updatePermissionsSchema = zod_1.z.object({
    permissions: zod_1.z.array(exports.permissionSchema),
});
exports.listUsersQuerySchema = zod_1.z.object({
    role: zod_1.z.enum(exports.ROLES).optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().optional(),
    includeInactive: zod_1.z.coerce.boolean().default(false),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
// ============================================
// PRESET PERMISSIONS POR ROL
// ============================================
exports.ROLE_PRESETS = {
    ADMIN: exports.MODULES.map(module => ({
        module,
        canView: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
    })),
    OPERATOR: [
        { module: 'MUSICADJ', canView: true, canEdit: true, canDelete: true, canExport: true },
        { module: 'KARAOKEYA', canView: true, canEdit: true, canDelete: true, canExport: true },
        { module: 'VENUES', canView: true, canEdit: false, canDelete: false, canExport: false },
        { module: 'EVENTS', canView: true, canEdit: false, canDelete: false, canExport: false },
        { module: 'CLIENTS', canView: true, canEdit: false, canDelete: false, canExport: false },
        { module: 'USERS', canView: false, canEdit: false, canDelete: false, canExport: false },
    ],
    VIEWER: exports.MODULES.map(module => ({
        module,
        canView: true,
        canEdit: false,
        canDelete: false,
        canExport: false,
    })),
};
//# sourceMappingURL=users.types.js.map