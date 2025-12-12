#!/usr/bin/env tsx
"use strict";
/**
 * Script para crear usuario administrador inicial
 *
 * Uso:
 *   npx tsx src/scripts/create-admin.ts
 *
 * O en Docker:
 *   docker compose -f docker-compose.prod.yml exec api npx tsx src/scripts/create-admin.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const password_1 = require("../shared/utils/password");
const prisma = new client_1.PrismaClient();
// Módulos disponibles en el sistema
const MODULES = [
    'MUSICADJ',
    'KARAOKEYA',
    'VENUES',
    'EVENTS',
    'CLIENTS',
    'USERS',
];
async function createAdmin() {
    console.log('[CREATE ADMIN] Starting admin creation...');
    // Credenciales por defecto del admin
    const adminData = {
        username: 'admin',
        email: 'admin@euforiaevents.com',
        password: 'Admin123!', // ⚠️ IMPORTANTE: Cambiar esta contraseña después del primer login
        role: 'ADMIN',
    };
    try {
        // 1. Verificar si ya existe un usuario admin
        const existingAdmin = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: adminData.username },
                    { email: adminData.email },
                    { role: 'ADMIN' },
                ],
            },
        });
        if (existingAdmin) {
            console.log('[CREATE ADMIN] ⚠️  Admin user already exists:');
            console.log(`  - ID: ${existingAdmin.id}`);
            console.log(`  - Username: ${existingAdmin.username}`);
            console.log(`  - Email: ${existingAdmin.email}`);
            console.log(`  - Role: ${existingAdmin.role}`);
            console.log('[CREATE ADMIN] Skipping creation.');
            return;
        }
        // 2. Hashear la contraseña
        console.log('[CREATE ADMIN] Hashing password...');
        const hashedPassword = await (0, password_1.hashPassword)(adminData.password);
        // 3. Crear el usuario admin
        console.log('[CREATE ADMIN] Creating admin user...');
        const admin = await prisma.user.create({
            data: {
                username: adminData.username,
                email: adminData.email,
                password: hashedPassword,
                role: adminData.role,
                isActive: true,
            },
        });
        console.log('[CREATE ADMIN] ✅ Admin user created successfully!');
        console.log(`  - ID: ${admin.id}`);
        console.log(`  - Username: ${admin.username}`);
        console.log(`  - Email: ${admin.email}`);
        console.log(`  - Role: ${admin.role}`);
        // 4. Crear permisos completos para todos los módulos
        console.log('[CREATE ADMIN] Creating full permissions for all modules...');
        for (const module of MODULES) {
            await prisma.userPermission.create({
                data: {
                    userId: admin.id,
                    module,
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canExport: true,
                },
            });
            console.log(`  - ✅ ${module}: Full access granted`);
        }
        console.log('[CREATE ADMIN] ✅ All permissions created successfully!');
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ADMIN USER CREATED SUCCESSFULLY');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('  Login credentials:');
        console.log(`    Username: ${adminData.username}`);
        console.log(`    Password: ${adminData.password}`);
        console.log('');
        console.log('  ⚠️  IMPORTANTE:');
        console.log('     Por favor, cambiar la contraseña después del primer login');
        console.log('     para mayor seguridad.');
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
    }
    catch (error) {
        console.error('[CREATE ADMIN] ❌ Error creating admin user:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Ejecutar el script
createAdmin()
    .then(() => {
    console.log('[CREATE ADMIN] Script completed successfully.');
    process.exit(0);
})
    .catch((error) => {
    console.error('[CREATE ADMIN] Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=create-admin.js.map