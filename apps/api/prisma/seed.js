"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed...');
    // Password por defecto - CAMBIAR EN PRODUCCIÓN
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, 10);
    // ================================
    // USUARIOS
    // ================================
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'euforiateclog@gmail.com',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });
    console.log('✅ Usuario admin creado/verificado:', {
        id: admin.id,
        username: admin.username,
        role: admin.role,
    });
    const operator = await prisma.user.upsert({
        where: { username: 'operador' },
        update: {},
        create: {
            username: 'operador',
            email: 'operador@euforia.events',
            password: hashedPassword,
            role: 'OPERATOR',
            isActive: true,
            permissions: {
                create: [
                    { module: 'MUSICADJ', canView: true, canEdit: true, canExport: false },
                    { module: 'KARAOKEYA', canView: true, canEdit: true, canExport: false },
                ],
            },
        },
    });
    console.log('✅ Usuario operador creado/verificado:', {
        id: operator.id,
        username: operator.username,
        role: operator.role,
    });
    // ================================
    // VENUE DE PRUEBA
    // ================================
    const venue = await prisma.venue.upsert({
        where: { id: 'venue-demo-001' },
        update: {},
        create: {
            id: 'venue-demo-001',
            name: 'Salón Demo',
            type: 'SALON',
            address: 'Av. Ejemplo 1234',
            city: 'Ushuaia',
            capacity: 200,
            contactName: 'Juan Demo',
            contactPhone: '2901-123456',
        },
    });
    console.log('✅ Venue demo creado/verificado:', venue.name);
    // ================================
    // CLIENTE DE PRUEBA
    // ================================
    const client = await prisma.client.upsert({
        where: { id: 'client-demo-001' },
        update: {},
        create: {
            id: 'client-demo-001',
            name: 'María Demo',
            company: 'Eventos Demo S.A.',
            phone: '2901-654321',
            email: 'maria@demo.com',
        },
    });
    console.log('✅ Cliente demo creado/verificado:', client.name);
    // ================================
    // EVENTO DE PRUEBA (ACTIVO)
    // ================================
    const event = await prisma.event.upsert({
        where: { slug: 'evento-demo-2501' },
        update: { status: 'ACTIVE' },
        create: {
            slug: 'evento-demo-2501',
            status: 'ACTIVE',
            venueId: venue.id,
            clientId: client.id,
            createdById: admin.id,
            eventData: {
                create: {
                    eventName: 'Evento Demo EUFORIA',
                    eventType: 'CORPORATE',
                    startDate: new Date(),
                    guestCount: 100,
                    notes: 'Evento de prueba para desarrollo',
                },
            },
            musicadjConfig: {
                create: {
                    enabled: true,
                    cooldownSeconds: 60,
                    allowWithoutSpotify: true,
                    welcomeMessage: '¡Bienvenido! Pedí tu tema favorito 🎵',
                    showQueueToClient: false,
                },
            },
        },
        include: {
            eventData: true,
            musicadjConfig: true,
        },
    });
    console.log('✅ Evento demo creado/verificado:', {
        id: event.id,
        slug: event.slug,
        status: event.status,
        name: event.eventData?.eventName,
        musicadjEnabled: event.musicadjConfig?.enabled,
    });
    // ================================
    // RESUMEN
    // ================================
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📋 DATOS DE PRUEBA');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('👤 Usuarios:');
    console.log('   admin / admin123 (ADMIN)');
    console.log('   operador / admin123 (OPERATOR)');
    console.log('');
    console.log('🎉 Evento activo:');
    console.log(`   ID: ${event.id}`);
    console.log(`   Slug: ${event.slug}`);
    console.log(`   URL QR: http://localhost:5173/e/${event.slug}`);
    console.log('');
    console.log('🎵 MUSICADJ:');
    console.log(`   POST http://localhost:3000/api/events/${event.id}/musicadj/requests`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambiar credenciales en producción!');
    console.log('');
}
main()
    .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map