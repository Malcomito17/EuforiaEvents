import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    BCRYPT_ROUNDS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    CLIENT_URL: z.ZodOptional<z.ZodString>;
    OPERATOR_URL: z.ZodOptional<z.ZodString>;
    PUBLIC_DOMAIN: z.ZodOptional<z.ZodString>;
    SPOTIFY_CLIENT_ID: z.ZodOptional<z.ZodString>;
    SPOTIFY_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    YOUTUBE_API_KEY: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    CLIENT_URL?: string | undefined;
    OPERATOR_URL?: string | undefined;
    PUBLIC_DOMAIN?: string | undefined;
    SPOTIFY_CLIENT_ID?: string | undefined;
    SPOTIFY_CLIENT_SECRET?: string | undefined;
    YOUTUBE_API_KEY?: string | undefined;
}, {
    DATABASE_URL: string;
    JWT_SECRET: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: string | undefined;
    JWT_EXPIRES_IN?: string | undefined;
    BCRYPT_ROUNDS?: string | undefined;
    CLIENT_URL?: string | undefined;
    OPERATOR_URL?: string | undefined;
    PUBLIC_DOMAIN?: string | undefined;
    SPOTIFY_CLIENT_ID?: string | undefined;
    SPOTIFY_CLIENT_SECRET?: string | undefined;
    YOUTUBE_API_KEY?: string | undefined;
}>;
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    CLIENT_URL?: string | undefined;
    OPERATOR_URL?: string | undefined;
    PUBLIC_DOMAIN?: string | undefined;
    SPOTIFY_CLIENT_ID?: string | undefined;
    SPOTIFY_CLIENT_SECRET?: string | undefined;
    YOUTUBE_API_KEY?: string | undefined;
};
export type Env = z.infer<typeof envSchema>;
export {};
//# sourceMappingURL=env.d.ts.map