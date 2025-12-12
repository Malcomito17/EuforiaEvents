"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('3000'),
    // Database
    DATABASE_URL: zod_1.z.string().min(1),
    // JWT
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    // Bcrypt
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).default('10'),
    // URLs
    CLIENT_URL: zod_1.z.string().url().optional(),
    OPERATOR_URL: zod_1.z.string().url().optional(),
    // Public domain (for production with Cloudflare Tunnel)
    PUBLIC_DOMAIN: zod_1.z.string().url().optional(),
    // Spotify (opcional para MVP)
    SPOTIFY_CLIENT_ID: zod_1.z.string().optional(),
    SPOTIFY_CLIENT_SECRET: zod_1.z.string().optional(),
    // YouTube API (para KARAOKEYA)
    YOUTUBE_API_KEY: zod_1.z.string().optional(),
});
function loadEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Error en variables de entorno:');
        result.error.issues.forEach((issue) => {
            console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
        });
        process.exit(1);
    }
    return result.data;
}
exports.env = loadEnv();
//# sourceMappingURL=env.js.map