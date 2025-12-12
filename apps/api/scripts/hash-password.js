#!/usr/bin/env node
/**
 * Script de utilidad para generar hash de contraseñas con bcrypt
 * Uso: node hash-password.js "mi-contraseña"
 */

const password = process.argv[2];

if (!password) {
  console.error('Error: Debe proporcionar una contraseña como argumento');
  process.exit(1);
}

// Cargar bcrypt desde node_modules
const bcrypt = require('bcrypt');

try {
  const hash = bcrypt.hashSync(password, 10);
  console.log(hash);
} catch (error) {
  console.error('Error al generar hash:', error.message);
  process.exit(1);
}
