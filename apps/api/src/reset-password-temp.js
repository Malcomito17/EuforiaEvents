"use strict";
/**
 * Script temporal para resetear contraseña de admin
 * Ejecutar: npx tsx reset-password-temp.ts <nueva-contraseña>
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function resetAdminPassword(newPassword) {
    try {
        // Generar hash
        const hash = await bcryptjs_1.default.hash(newPassword, 10);
        // Actualizar contraseña
        const user = await prisma.user.update({
            where: { username: 'admin' },
            data: { password: hash },
        });
        console.log(`✅ Contraseña de ${user.username} actualizada correctamente`);
        console.log(`Nueva contraseña: ${newPassword}`);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
const newPassword = process.argv[2];
if (!newPassword) {
    console.error('❌ Error: Debes proporcionar la nueva contraseña');
    console.log('Uso: npx tsx reset-password-temp.ts <nueva-contraseña>');
    process.exit(1);
}
resetAdminPassword(newPassword);
//# sourceMappingURL=reset-password-temp.js.map