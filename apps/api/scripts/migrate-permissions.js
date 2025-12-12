"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function migratePermissions() {
    console.log('[MIGRATION] Starting permissions migration...');
    // 1. Agregar columnas canEdit y canDelete si no existen
    try {
        await prisma.$executeRaw `
      ALTER TABLE user_permissions ADD COLUMN canEdit INTEGER DEFAULT 0
    `;
        console.log('[MIGRATION] Added canEdit column');
    }
    catch (e) {
        if (e.message?.includes('duplicate column')) {
            console.log('[MIGRATION] canEdit column already exists');
        }
        else {
            throw e;
        }
    }
    try {
        await prisma.$executeRaw `
      ALTER TABLE user_permissions ADD COLUMN canDelete INTEGER DEFAULT 0
    `;
        console.log('[MIGRATION] Added canDelete column');
    }
    catch (e) {
        if (e.message?.includes('duplicate column')) {
            console.log('[MIGRATION] canDelete column already exists');
        }
        else {
            throw e;
        }
    }
    // 2. Copiar valores de canOperate a canEdit
    await prisma.$executeRaw `
    UPDATE user_permissions SET canEdit = canOperate WHERE canOperate IS NOT NULL
  `;
    console.log('[MIGRATION] Copied canOperate to canEdit');
    console.log('[MIGRATION] Migration complete!');
    await prisma.$disconnect();
}
migratePermissions().catch(console.error);
//# sourceMappingURL=migrate-permissions.js.map