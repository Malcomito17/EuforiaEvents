import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Password por defecto - CAMBIAR EN PRODUCCIÓN
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

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
  })

  console.log('✅ Usuario admin creado/verificado:', {
    id: admin.id,
    username: admin.username,
    role: admin.role,
  })

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
  })

  console.log('✅ Usuario operador creado/verificado:', {
    id: operator.id,
    username: operator.username,
    role: operator.role,
  })

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
  })

  console.log('✅ Venue demo creado/verificado:', venue.name)

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
  })

  console.log('✅ Cliente demo creado/verificado:', client.name)

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
  })

  console.log('✅ Evento demo creado/verificado:', {
    id: event.id,
    slug: event.slug,
    status: event.status,
    name: event.eventData?.eventName,
    musicadjEnabled: event.musicadjConfig?.enabled,
  })

  // ================================
  // PLATOS DE PRUEBA
  // ================================

  const platosData = [
    { nombre: 'Empanadas de carne', categoria: 'ENTRADA', dietaryInfo: [] },
    { nombre: 'Bruschetta de tomate', categoria: 'ENTRADA', dietaryInfo: ['VEGETARIANO', 'VEGANO'] },
    { nombre: 'Tabla de quesos', categoria: 'ENTRADA', dietaryInfo: ['VEGETARIANO'] },
    { nombre: 'Carpaccio de salmón', categoria: 'ENTRADA', dietaryInfo: ['PESCETARIANO', 'SIN_GLUTEN'] },
    { nombre: 'Bife de chorizo', categoria: 'PRINCIPAL', dietaryInfo: ['SIN_GLUTEN'] },
    { nombre: 'Salmón grillé', categoria: 'PRINCIPAL', dietaryInfo: ['PESCETARIANO', 'SIN_GLUTEN'] },
    { nombre: 'Ravioles de ricota', categoria: 'PRINCIPAL', dietaryInfo: ['VEGETARIANO'] },
    { nombre: 'Risotto de hongos', categoria: 'PRINCIPAL', dietaryInfo: ['VEGETARIANO', 'SIN_GLUTEN'] },
    { nombre: 'Milanesa de pollo', categoria: 'PRINCIPAL', dietaryInfo: [] },
    { nombre: 'Ensalada César vegana', categoria: 'PRINCIPAL', dietaryInfo: ['VEGANO', 'SIN_GLUTEN'] },
    { nombre: 'Papas rústicas', categoria: 'GUARNICION', dietaryInfo: ['VEGANO', 'SIN_GLUTEN'] },
    { nombre: 'Verduras grilladas', categoria: 'GUARNICION', dietaryInfo: ['VEGANO', 'SIN_GLUTEN'] },
    { nombre: 'Tiramisú', categoria: 'POSTRE', dietaryInfo: ['VEGETARIANO'] },
    { nombre: 'Flan casero', categoria: 'POSTRE', dietaryInfo: ['VEGETARIANO', 'SIN_GLUTEN'] },
    { nombre: 'Brownie sin gluten', categoria: 'POSTRE', dietaryInfo: ['VEGETARIANO', 'SIN_GLUTEN'] },
    { nombre: 'Helado vegano', categoria: 'POSTRE', dietaryInfo: ['VEGANO', 'SIN_GLUTEN'] },
    { nombre: 'Vino tinto', categoria: 'BEBIDA', dietaryInfo: ['VEGANO'] },
    { nombre: 'Gaseosas', categoria: 'BEBIDA', dietaryInfo: ['VEGANO'] },
    { nombre: 'Agua mineral', categoria: 'BEBIDA', dietaryInfo: ['VEGANO'] },
  ]

  const platos = []
  for (const platoData of platosData) {
    const plato = await prisma.dish.upsert({
      where: { id: `dish-${platoData.nombre.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `dish-${platoData.nombre.toLowerCase().replace(/\s+/g, '-')}`,
        nombre: platoData.nombre,
        categoria: platoData.categoria,
        dietaryInfo: JSON.stringify(platoData.dietaryInfo),
        createdBy: admin.id,
      },
    })
    platos.push(plato)
  }

  console.log(`✅ ${platos.length} platos creados/verificados`)

  // ================================
  // MENÚ DEL EVENTO
  // ================================

  // Agregar algunos platos al menú del evento
  const platosMenu = platos.slice(0, 12) // Primeros 12 platos
  for (let i = 0; i < platosMenu.length; i++) {
    const plato = platosMenu[i]
    await prisma.eventDish.upsert({
      where: {
        eventId_dishId: {
          eventId: event.id,
          dishId: plato.id,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        dishId: plato.id,
        orden: i + 1,
        esDefault: i < 4, // Los primeros 4 son default
      },
    })
  }

  console.log(`✅ ${platosMenu.length} platos agregados al menú del evento`)

  // ================================
  // MESAS DE PRUEBA
  // ================================

  const mesasData = [
    { numero: '1', capacidad: 8, forma: 'REDONDA', sector: 'Principal', x: 100, y: 100 },
    { numero: '2', capacidad: 8, forma: 'REDONDA', sector: 'Principal', x: 250, y: 100 },
    { numero: '3', capacidad: 8, forma: 'REDONDA', sector: 'Principal', x: 400, y: 100 },
    { numero: '4', capacidad: 10, forma: 'RECTANGULAR', sector: 'VIP', x: 100, y: 250 },
    { numero: '5', capacidad: 10, forma: 'RECTANGULAR', sector: 'VIP', x: 300, y: 250 },
    { numero: '6', capacidad: 6, forma: 'CUADRADA', sector: 'Lateral', x: 500, y: 250 },
    { numero: '7', capacidad: 8, forma: 'REDONDA', sector: 'Principal', x: 100, y: 400 },
    { numero: '8', capacidad: 8, forma: 'REDONDA', sector: 'Principal', x: 250, y: 400 },
  ]

  const mesas = []
  for (const mesaData of mesasData) {
    const mesa = await prisma.mesa.upsert({
      where: {
        eventId_numero: {
          eventId: event.id,
          numero: mesaData.numero,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        numero: mesaData.numero,
        capacidad: mesaData.capacidad,
        forma: mesaData.forma,
        sector: mesaData.sector,
        x: mesaData.x,
        y: mesaData.y,
        rotation: 0,
        createdBy: admin.id,
      },
    })
    mesas.push(mesa)
  }

  console.log(`✅ ${mesas.length} mesas creadas/verificadas`)

  // ================================
  // PERSONAS DE PRUEBA
  // ================================

  const personasData = [
    { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@email.com', phone: '2901-111111', company: 'Tech SA', dietaryRestrictions: [] },
    { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@email.com', phone: '2901-222222', company: 'Design Co', dietaryRestrictions: ['VEGETARIANO'] },
    { nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@email.com', phone: '2901-333333', company: 'Finance Ltd', dietaryRestrictions: [] },
    { nombre: 'Ana', apellido: 'Martínez', email: 'ana.martinez@email.com', phone: '2901-444444', company: 'Marketing Pro', dietaryRestrictions: ['VEGANO'] },
    { nombre: 'Pedro', apellido: 'García', email: 'pedro.garcia@email.com', phone: '2901-555555', company: 'Tech SA', dietaryRestrictions: ['SIN_GLUTEN'] },
    { nombre: 'Laura', apellido: 'Rodríguez', email: 'laura.rodriguez@email.com', phone: '2901-666666', company: 'Design Co', dietaryRestrictions: [] },
    { nombre: 'Diego', apellido: 'Fernández', email: 'diego.fernandez@email.com', phone: '2901-777777', company: 'Consulting Group', dietaryRestrictions: ['KOSHER'] },
    { nombre: 'Sofía', apellido: 'Sánchez', email: 'sofia.sanchez@email.com', phone: '2901-888888', company: 'Marketing Pro', dietaryRestrictions: ['VEGETARIANO', 'SIN_LACTOSA'] },
    { nombre: 'Martín', apellido: 'Torres', email: 'martin.torres@email.com', phone: '2901-999999', company: 'Tech SA', dietaryRestrictions: [] },
    { nombre: 'Lucía', apellido: 'Díaz', email: 'lucia.diaz@email.com', phone: '2901-101010', company: 'Finance Ltd', dietaryRestrictions: ['PESCETARIANO'] },
    { nombre: 'Pablo', apellido: 'Ruiz', email: 'pablo.ruiz@email.com', phone: '2901-121212', company: 'Consulting Group', dietaryRestrictions: [] },
    { nombre: 'Valentina', apellido: 'Moreno', email: 'valentina.moreno@email.com', phone: '2901-131313', company: 'Design Co', dietaryRestrictions: ['VEGANO'] },
    { nombre: 'Andrés', apellido: 'Álvarez', email: 'andres.alvarez@email.com', phone: '2901-141414', company: 'Finance Ltd', dietaryRestrictions: [] },
    { nombre: 'Camila', apellido: 'Romero', email: 'camila.romero@email.com', phone: '2901-151515', company: 'Marketing Pro', dietaryRestrictions: ['SIN_GLUTEN', 'SIN_LACTOSA'] },
    { nombre: 'Nicolás', apellido: 'Acosta', email: 'nicolas.acosta@email.com', phone: '2901-161616', company: 'Tech SA', dietaryRestrictions: [] },
    { nombre: 'Isabella', apellido: 'Castro', email: null, phone: '2901-171717', company: 'Design Co', dietaryRestrictions: [] },
    { nombre: 'Sebastián', apellido: 'Vargas', email: null, phone: '2901-181818', company: 'Consulting Group', dietaryRestrictions: ['DIABETICO'] },
    { nombre: 'Antonella', apellido: 'Medina', email: 'antonella.medina@email.com', phone: '2901-191919', company: 'Finance Ltd', dietaryRestrictions: [] },
    { nombre: 'Tomás', apellido: 'Herrera', email: 'tomas.herrera@email.com', phone: '2901-202020', company: 'Marketing Pro', dietaryRestrictions: ['VEGETARIANO'] },
    { nombre: 'Florencia', apellido: 'Molina', email: 'florencia.molina@email.com', phone: '2901-212121', company: 'Tech SA', dietaryRestrictions: [] },
  ]

  const personas = []
  for (const personaData of personasData) {
    // Generar identityHash
    const crypto = await import('crypto')
    const normalized = `${personaData.email?.toLowerCase().trim() || ''}${personaData.nombre.toLowerCase().trim()}${personaData.apellido.toLowerCase().trim()}`
    const identityHash = crypto.createHash('sha256').update(normalized).digest('hex')

    const persona = await prisma.person.upsert({
      where: { identityHash },
      update: {},
      create: {
        nombre: personaData.nombre,
        apellido: personaData.apellido,
        email: personaData.email,
        phone: personaData.phone,
        company: personaData.company,
        dietaryRestrictions: JSON.stringify(personaData.dietaryRestrictions),
        identityHash,
        createdBy: admin.id,
      },
    })
    personas.push(persona)
  }

  console.log(`✅ ${personas.length} personas creadas/verificadas`)

  // ================================
  // INVITADOS DEL EVENTO
  // ================================

  const invitados = []

  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i]
    const mesa = mesas[i % mesas.length] // Distribuir en mesas
    const accesibilidad = i === 5 ? 'MOVILIDAD_REDUCIDA' : i === 10 ? 'VISUAL' : 'NINGUNA'

    const invitado = await prisma.eventGuest.upsert({
      where: {
        eventId_personId: {
          eventId: event.id,
          personId: persona.id,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        personId: persona.id,
        mesaId: mesa.id,
        estadoIngreso: i < 5 ? 'INGRESADO' : 'PENDIENTE', // Los primeros 5 ya ingresaron
        checkedInAt: i < 5 ? new Date() : null,
        checkedInBy: i < 5 ? admin.id : null,
        accesibilidad,
        observaciones: i === 3 ? 'VIP - Cliente importante' : i === 7 ? 'Llegará tarde' : null,
        addedBy: admin.id,
      },
    })
    invitados.push(invitado)
  }

  console.log(`✅ ${invitados.length} invitados agregados al evento`)
  console.log(`   - ${invitados.filter((_, i) => i < 5).length} ya ingresados`)
  console.log(`   - ${invitados.filter((_, i) => i >= 5).length} pendientes`)

  // ================================
  // RESUMEN
  // ================================

  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('📋 DATOS DE PRUEBA')
  console.log('═══════════════════════════════════════')
  console.log('')
  console.log('👤 Usuarios:')
  console.log('   admin / admin123 (ADMIN)')
  console.log('   operador / admin123 (OPERATOR)')
  console.log('')
  console.log('🎉 Evento activo:')
  console.log(`   ID: ${event.id}`)
  console.log(`   Slug: ${event.slug}`)
  console.log(`   URL QR: http://localhost:5173/e/${event.slug}`)
  console.log('')
  console.log('📊 Datos de prueba:')
  console.log(`   - ${platos.length} platos en catálogo`)
  console.log(`   - ${platosMenu.length} platos en menú del evento`)
  console.log(`   - ${mesas.length} mesas`)
  console.log(`   - ${personas.length} personas`)
  console.log(`   - ${invitados.length} invitados (5 ingresados, 15 pendientes)`)
  console.log('')
  console.log('🎵 MUSICADJ:')
  console.log(`   POST http://localhost:3000/api/events/${event.id}/musicadj/requests`)
  console.log('')
  console.log('⚠️  IMPORTANTE: Cambiar credenciales en producción!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
