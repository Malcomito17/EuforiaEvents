import { z } from 'zod';
import type { JwtPayload } from '../../shared/types';
export declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["ADMIN", "MANAGER", "OPERATOR"]>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    role: "ADMIN" | "OPERATOR" | "MANAGER";
    email?: string | undefined;
}, {
    username: string;
    password: string;
    email?: string | undefined;
    role?: "ADMIN" | "OPERATOR" | "MANAGER" | undefined;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
declare class AuthService {
    /**
     * Genera un JWT para el usuario
     */
    generateToken(payload: JwtPayload): string;
    /**
     * Verifica y decodifica un JWT
     */
    verifyToken(token: string): JwtPayload;
    /**
     * Login de usuario
     */
    login(input: LoginInput): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            email: string | null;
            role: string;
            permissions: {
                id: string;
                module: string;
                canView: boolean;
                canEdit: boolean;
                canDelete: boolean;
                canExport: boolean;
                userId: string;
            }[];
        };
    }>;
    /**
     * Registro de nuevo usuario (solo admin puede crear)
     */
    register(input: RegisterInput, creatorRole?: string): Promise<{
        id: string;
        username: string;
        email: string | null;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    /**
     * Obtiene el usuario actual por ID
     */
    getCurrentUser(userId: string): Promise<{
        id: string;
        username: string;
        email: string | null;
        role: string;
        isActive: boolean;
        permissions: {
            id: string;
            module: string;
            canView: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canExport: boolean;
            userId: string;
        }[];
        createdAt: Date;
    }>;
    /**
     * Cambia la contraseña del usuario
     */
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
export declare class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map