import { z } from 'zod';
export declare const ROLES: readonly ["ADMIN", "OPERATOR", "VIEWER"];
export declare const MODULES: readonly ["MUSICADJ", "KARAOKEYA", "VENUES", "EVENTS", "CLIENTS", "USERS"];
export type Role = typeof ROLES[number];
export type Module = typeof MODULES[number];
export declare const permissionSchema: z.ZodObject<{
    module: z.ZodEnum<["MUSICADJ", "KARAOKEYA", "VENUES", "EVENTS", "CLIENTS", "USERS"]>;
    canView: z.ZodDefault<z.ZodBoolean>;
    canEdit: z.ZodDefault<z.ZodBoolean>;
    canDelete: z.ZodDefault<z.ZodBoolean>;
    canExport: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
}, {
    module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
    canView?: boolean | undefined;
    canEdit?: boolean | undefined;
    canDelete?: boolean | undefined;
    canExport?: boolean | undefined;
}>;
export declare const createUserSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodEnum<["ADMIN", "OPERATOR", "VIEWER"]>;
    permissions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        module: z.ZodEnum<["MUSICADJ", "KARAOKEYA", "VENUES", "EVENTS", "CLIENTS", "USERS"]>;
        canView: z.ZodDefault<z.ZodBoolean>;
        canEdit: z.ZodDefault<z.ZodBoolean>;
        canDelete: z.ZodDefault<z.ZodBoolean>;
        canExport: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }, {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView?: boolean | undefined;
        canEdit?: boolean | undefined;
        canDelete?: boolean | undefined;
        canExport?: boolean | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    role: "ADMIN" | "OPERATOR" | "VIEWER";
    permissions: {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[];
    email?: string | undefined;
}, {
    username: string;
    password: string;
    role: "ADMIN" | "OPERATOR" | "VIEWER";
    email?: string | undefined;
    permissions?: {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView?: boolean | undefined;
        canEdit?: boolean | undefined;
        canDelete?: boolean | undefined;
        canExport?: boolean | undefined;
    }[] | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "OPERATOR", "VIEWER"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        module: z.ZodEnum<["MUSICADJ", "KARAOKEYA", "VENUES", "EVENTS", "CLIENTS", "USERS"]>;
        canView: z.ZodDefault<z.ZodBoolean>;
        canEdit: z.ZodDefault<z.ZodBoolean>;
        canDelete: z.ZodDefault<z.ZodBoolean>;
        canExport: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }, {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView?: boolean | undefined;
        canEdit?: boolean | undefined;
        canDelete?: boolean | undefined;
        canExport?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    username?: string | undefined;
    email?: string | null | undefined;
    password?: string | undefined;
    role?: "ADMIN" | "OPERATOR" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
    permissions?: {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[] | undefined;
}, {
    username?: string | undefined;
    email?: string | null | undefined;
    password?: string | undefined;
    role?: "ADMIN" | "OPERATOR" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
    permissions?: {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView?: boolean | undefined;
        canEdit?: boolean | undefined;
        canDelete?: boolean | undefined;
        canExport?: boolean | undefined;
    }[] | undefined;
}>;
export declare const updatePermissionsSchema: z.ZodObject<{
    permissions: z.ZodArray<z.ZodObject<{
        module: z.ZodEnum<["MUSICADJ", "KARAOKEYA", "VENUES", "EVENTS", "CLIENTS", "USERS"]>;
        canView: z.ZodDefault<z.ZodBoolean>;
        canEdit: z.ZodDefault<z.ZodBoolean>;
        canDelete: z.ZodDefault<z.ZodBoolean>;
        canExport: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }, {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView?: boolean | undefined;
        canEdit?: boolean | undefined;
        canDelete?: boolean | undefined;
        canExport?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    permissions: {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[];
}, {
    permissions: {
        module: "MUSICADJ" | "KARAOKEYA" | "VENUES" | "EVENTS" | "CLIENTS" | "USERS";
        canView?: boolean | undefined;
        canEdit?: boolean | undefined;
        canDelete?: boolean | undefined;
        canExport?: boolean | undefined;
    }[];
}>;
export declare const listUsersQuerySchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "OPERATOR", "VIEWER"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    includeInactive: z.ZodDefault<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    includeInactive: boolean;
    role?: "ADMIN" | "OPERATOR" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}, {
    role?: "ADMIN" | "OPERATOR" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    includeInactive?: boolean | undefined;
}>;
export type Permission = z.infer<typeof permissionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export declare const ROLE_PRESETS: Record<Role, Permission[]>;
//# sourceMappingURL=users.types.d.ts.map