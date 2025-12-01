import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Password por defecto - CAMBIAR EN PRODUCCIÓN
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  // Crear o actualizar usuario admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@euforia.events',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Usuario admin creado/verificado:', {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
  })

  // Crear usuario operador de ejemplo
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
          { module: 'MUSICADJ', canView: true, canOperate: true, canExport: false },
          { module: 'KARAOKEYA', canView: true, canOperate: true, canExport: false },
        ],
      },
    },
  })

  console.log('✅ Usuario operador creado/verificado:', {
    id: operator.id,
    username: operator.username,
    role: operator.role,
  })

  console.log('')
  console.log('📋 Credenciales por defecto:')
  console.log('   Usuario: admin')
  console.log('   Password:', defaultPassword)
  console.log('')
  console.log('⚠️  IMPORTANTE: Cambiar la contraseña en producción!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
