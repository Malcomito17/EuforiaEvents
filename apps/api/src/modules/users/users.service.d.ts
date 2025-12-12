import { type CreateUserInput, type UpdateUserInput, type ListUsersQuery, type Permission } from './users.types';
declare class UsersError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
/**
 * Lista usuarios con filtros y paginación
 */
export declare function listUsers(filters: ListUsersQuery): Promise<{
    users: {
        id: string;
        username: string;
        email: string | null;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        permissions: {
            id: string;
            module: string;
            canView: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canExport: boolean;
        }[];
    }[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}>;
/**
 * Obtiene un usuario por ID
 */
export declare function getUserById(userId: string): Promise<{
    id: string;
    username: string;
    email: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
        id: string;
        module: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[];
}>;
/**
 * Crea un nuevo usuario
 */
export declare function createUser(input: CreateUserInput): Promise<{
    id: string;
    username: string;
    email: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
        id: string;
        module: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[];
}>;
/**
 * Actualiza un usuario
 */
export declare function updateUser(userId: string, input: UpdateUserInput): Promise<{
    id: string;
    username: string;
    email: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
        id: string;
        module: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[];
}>;
/**
 * Actualiza solo los permisos de un usuario
 */
export declare function updateUserPermissions(userId: string, permissions: Permission[]): Promise<{
    id: string;
    username: string;
    email: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
        id: string;
        module: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[];
}>;
/**
 * Elimina un usuario (soft delete)
 */
export declare function deleteUser(userId: string): Promise<{
    message: string;
    user: {
        id: string;
        username: string;
        isActive: boolean;
    };
}>;
/**
 * Reactiva un usuario
 */
export declare function reactivateUser(userId: string): Promise<{
    id: string;
    username: string;
    email: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
        id: string;
        module: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[];
}>;
/**
 * Obtiene los permisos preset para un rol
 */
export declare function getRolePreset(role: string): Permission[];
/**
 * Verifica si un usuario tiene un permiso específico
 */
export declare function userHasPermission(userId: string, module: string, action: 'view' | 'edit' | 'delete' | 'export'): Promise<boolean>;
export { UsersError };
//# sourceMappingURL=users.service.d.ts.map