# Scripts de Administración

## Reset de Password

Script CLI para resetear el password de cualquier usuario sin necesidad de acceso al panel.

### Uso Local (Desarrollo)

```bash
cd apps/api
npx tsx scripts/reset-password.ts <username> <new-password>
```

**Ejemplos:**
```bash
# Resetear password del admin
npx tsx scripts/reset-password.ts admin MiNuevoPassword123

# Resetear password del operador
npx tsx scripts/reset-password.ts operador OtroPassword456
```

### Uso en Producción (Docker)

En el Raspberry Pi, ejecutar desde el directorio del proyecto:

```bash
# Resetear password del admin
docker exec euforia-api-prod npx tsx scripts/reset-password.ts admin MiNuevoPassword123

# Resetear password del operador
docker exec euforia-api-prod npx tsx scripts/reset-password.ts operador OtroPassword456
```

### Validaciones

- El script verifica que el usuario exista
- El password debe tener al menos 6 caracteres
- Si el usuario no existe, muestra la lista de usuarios disponibles
- El password se hashea con bcrypt antes de guardarse en la base de datos

### Notas de Seguridad

⚠️ **IMPORTANTE**:
- Este script tiene acceso directo a la base de datos
- Solo debe ser ejecutado por administradores del sistema
- En producción, ejecutar desde SSH en el servidor
- No compartir passwords por canales inseguros
- Usar passwords fuertes (mínimo 12 caracteres, combinación de letras, números y símbolos)

### Credenciales por Defecto

Las credenciales creadas por el seed son:

```
Username: admin
Password: admin123
Email: euforiateclog@gmail.com
Role: ADMIN
```

⚠️ **CAMBIAR INMEDIATAMENTE EN PRODUCCIÓN**

### Troubleshooting

**Error: "Usuario no encontrado"**
- Verificar que el username esté escrito correctamente
- El script mostrará la lista de usuarios disponibles

**Error: "Password debe tener al menos 6 caracteres"**
- Usar un password más largo

**Error de conexión a base de datos**
- Verificar que la variable de entorno DATABASE_URL esté configurada
- En Docker, verificar que el contenedor esté corriendo
