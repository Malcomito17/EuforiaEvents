#!/usr/bin/env tsx
"use strict";
/**
 * Script CLI para resetear password de un usuario
 *
 * Uso:
 *   npx tsx scripts/reset-password.ts <username> <new-password>
 *
 * Ejemplos:
 *   npx tsx scripts/reset-password.ts admin newpass123
 *
 * En Docker/Producción:
 *   docker exec euforia-api-prod npx tsx scripts/reset-password.ts admin newpass123
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function resetPassword(username, newPassword) {
    console.log('🔐 RESET DE PASSWORD');
    console.log('═══════════════════════════════════════');
    console.log(`Usuario: ${username}`);
    console.log('');
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
        where: { username },
    });
    if (!user) {
        console.error(`❌ Error: Usuario '${username}' no encontrado`);
        console.log('');
        console.log('Usuarios disponibles:');
        const users = await prisma.user.findMany({
            select: { username: true, role: true },
        });
        users.forEach(u => {
            console.log(`   • ${u.username} (${u.role})`);
        });
        process.exit(1);
    }
    // Hash del nuevo password
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // Actualizar password
    await prisma.user.update({
        where: { username },
        data: { password: hashedPassword },
    });
    console.log(`✅ Password actualizado correctamente para '${username}'`);
    console.log('');
    console.log('📋 Información del usuario:');
    console.log(`   Usuario: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Estado: ${user.isActive ? 'Activo' : 'Inactivo'}`);
    console.log('');
    console.log('⚠️  Asegúrate de guardar este password en un lugar seguro!');
    console.log('');
}
// Main
const username = process.argv[2];
const newPassword = process.argv[3];
if (!username || !newPassword) {
    console.error('❌ Error: Parámetros faltantes');
    console.log('');
    console.log('Uso:');
    console.log('  npx tsx scripts/reset-password.ts <username> <new-password>');
    console.log('');
    console.log('Ejemplos:');
    console.log('  npx tsx scripts/reset-password.ts admin newpass123');
    console.log('  docker exec euforia-api-prod npx tsx scripts/reset-password.ts admin newpass123');
    console.log('');
    process.exit(1);
}
if (newPassword.length < 6) {
    console.error('❌ Error: El password debe tener al menos 6 caracteres');
    process.exit(1);
}
resetPassword(username, newPassword)
    .catch((e) => {
    console.error('❌ Error al resetear password:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reset-password.js.map