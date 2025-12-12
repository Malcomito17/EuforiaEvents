#!/bin/bash
#
# Script para resetear la contraseña del usuario admin
# Uso: ./reset-admin-password.sh <nueva-contraseña>
#

if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar la nueva contraseña"
  echo "Uso: ./reset-admin-password.sh <nueva-contraseña>"
  exit 1
fi

NEW_PASSWORD="$1"

echo "🔐 Reseteando contraseña del usuario admin..."
echo "Nueva contraseña: $NEW_PASSWORD"
echo ""

# Generar hash usando bcryptjs desde el contenedor
HASH=$(docker exec euforia-api-prod node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('$NEW_PASSWORD', 10));
" 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ Error generando hash: $HASH"
  exit 1
fi

echo "Hash generado: ${HASH:0:20}..."
echo ""

# Actualizar en la base de datos usando un script temporal
docker exec euforia-api-prod node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePassword() {
  try {
    await prisma.user.update({
      where: { username: 'admin' },
      data: { password: '$HASH' }
    });
    console.log('OK');
  } catch (error) {
    console.error('ERROR');
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

updatePassword();
" 2>&1 | grep -q "OK"

if [ $? -eq 0 ]; then
  echo "✅ Contraseña de admin actualizada correctamente"
  echo ""
  echo "Credenciales:"
  echo "  Usuario: admin"
  echo "  Contraseña: $NEW_PASSWORD"
else
  echo "❌ Error al actualizar la contraseña en la base de datos"
  exit 1
fi
