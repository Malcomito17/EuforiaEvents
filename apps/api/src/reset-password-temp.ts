/**
 * Script temporal para resetear contraseña de admin
 * Ejecutar: npx tsx reset-password-temp.ts <nueva-contraseña>
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function resetAdminPassword(newPassword: string) {
  try {
    // Generar hash
    const hash = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    const user = await prisma.user.update({
      where: { username: 'admin' },
      data: { password: hash },
    })

    console.log(`✅ Contraseña de ${user.username} actualizada correctamente`)
    console.log(`Nueva contraseña: ${newPassword}`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const newPassword = process.argv[2]

if (!newPassword) {
  console.error('❌ Error: Debes proporcionar la nueva contraseña')
  console.log('Uso: npx tsx reset-password-temp.ts <nueva-contraseña>')
  process.exit(1)
}

resetAdminPassword(newPassword)
