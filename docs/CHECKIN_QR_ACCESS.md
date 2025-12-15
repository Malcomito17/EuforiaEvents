# Check-in QR Code - Acceso Directo

## 📱 Funcionalidad

Sistema de acceso directo al check-in mediante código QR o link, sin necesidad de login.

**Objetivo**: Facilitar el acceso de recepcionistas (rol RECEPTION) a la app de check-in del evento.

---

## 🔑 Cómo funciona

1. **El operador genera** un QR code o link desde web-operator
2. **El operador envía** el QR/link a los recepcionistas
3. **Los recepcionistas acceden** directamente al check-in del evento
4. **No requieren credenciales** (acceso mediante token único)

---

## 🚀 Endpoints disponibles

### 1. Generar/Regenerar Token

```http
POST /api/events/:eventId/checkin/generate-token
Authorization: Bearer {token}
```

**Requiere**: Rol ADMIN o MANAGER

**Response**:
```json
{
  "success": true,
  "message": "Token generado exitosamente",
  "token": "a1b2c3d4e5f6..."
}
```

**Cuándo usar**:
- Al configurar el evento por primera vez
- Si se compromete el token anterior
- Para invalidar accesos anteriores

---

### 2. Obtener Link de Acceso

```http
GET /api/events/:eventId/checkin/link
Authorization: Bearer {token}
```

**Requiere**: Autenticado (cualquier rol)

**Response**:
```json
{
  "success": true,
  "url": "http://localhost:5175/event/mi-evento-123?token=a1b2c3d4e5f6...",
  "token": "a1b2c3d4e5f6..."
}
```

**Cuándo usar**:
- Para obtener el link y enviarlo por WhatsApp/Email
- Para copiar el link directamente

**Nota**: Si el evento no tiene token, se genera uno automáticamente.

---

### 3. Obtener QR Code

```http
GET /api/events/:eventId/checkin/qr
Authorization: Bearer {token}
```

**Requiere**: Autenticado (cualquier rol)

**Response**:
```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Cuándo usar**:
- Para mostrar el QR en pantalla del operador
- Para imprimir el QR y ponerlo en la recepción
- Para compartir el QR por imagen

**Formato**: Data URL (base64) - Listo para usar en `<img src="..." />`

---

## 💻 Ejemplo de uso en Frontend

### Obtener y mostrar QR

```typescript
// Obtener el QR code
const response = await fetch(`/api/events/${eventId}/checkin/qr`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const { qr } = await response.json()

// Mostrar en la UI
<img src={qr} alt="Check-in QR Code" />
```

### Obtener link para compartir

```typescript
// Obtener el link
const response = await fetch(`/api/events/${eventId}/checkin/link`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const { url } = await response.json()

// Copiar al clipboard
navigator.clipboard.writeText(url)

// O compartir por WhatsApp
const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`
window.open(whatsappUrl, '_blank')
```

### Regenerar token (por seguridad)

```typescript
// Regenerar token
const response = await fetch(`/api/events/${eventId}/checkin/generate-token`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const { token: newToken } = await response.json()

// El token anterior queda invalidado
// Necesitas obtener el nuevo QR/link
```

---

## 🔒 Seguridad

### Token único por evento
- Cada evento tiene su propio `checkinAccessToken`
- El token es único y no se repite entre eventos
- 64 caracteres hexadecimales (SHA-256)

### Regeneración
- Se puede regenerar en cualquier momento
- Al regenerar, el token anterior queda **invalidado**
- Útil si se compromete el acceso

### Validación
- El backend valida el token antes de permitir acceso
- El token debe coincidir exactamente con el almacenado
- Si el evento no tiene token, el acceso es **denegado**

### Alcance limitado
- El token **solo** permite acceso al check-in
- **No** permite editar configuración del evento
- **No** permite acceso a otros módulos
- Perfecto para usuarios de perfil RECEPTION

---

## 🌐 Configuración

### Variable de entorno

```env
# URL base de la app de check-in
CHECKIN_APP_URL=http://localhost:5175

# En producción
CHECKIN_APP_URL=https://checkin.euforia.events
```

### URL generada

```
{CHECKIN_APP_URL}/event/{slug}?token={checkinAccessToken}
```

**Ejemplo**:
```
http://localhost:5175/event/boda-maria-juan?token=a1b2c3d4e5f6...
```

---

## 📋 Casos de uso

### Caso 1: Setup inicial del evento

1. Operador crea el evento
2. Operador genera el QR: `GET /api/events/:id/checkin/qr`
3. Operador imprime el QR
4. Operador coloca el QR en la mesa de recepción
5. Recepcionistas escanean y acceden

### Caso 2: Envío por WhatsApp

1. Operador obtiene el link: `GET /api/events/:id/checkin/link`
2. Operador copia el link
3. Operador envía por WhatsApp a recepcionistas
4. Recepcionistas hacen click y acceden

### Caso 3: Cambio de recepcionista (seguridad)

1. Termina el turno del recepcionista A
2. Operador regenera token: `POST /api/events/:id/checkin/generate-token`
3. El link/QR anterior queda invalidado
4. Operador genera nuevo QR para recepcionista B
5. Solo el recepcionista B tiene acceso

---

## ✅ Ventajas

- ✅ **Sin login**: Recepcionistas no necesitan usuario/contraseña
- ✅ **Rápido**: Escanear QR y listo
- ✅ **Seguro**: Token único y regenerable
- ✅ **Flexible**: QR impreso o link por mensaje
- ✅ **Control**: Se puede invalidar en cualquier momento

---

## 🎯 Próximos pasos

Para implementar en el frontend:

1. **Web Operator**:
   - Agregar botón "Generar QR Check-in" en la página del evento
   - Modal para mostrar QR y link
   - Opciones: Imprimir, Copiar link, Compartir WhatsApp
   - Botón "Regenerar" con confirmación

2. **Web Check-in**:
   - Detectar parámetro `?token=` en la URL
   - Validar token con el backend
   - Si es válido, permitir acceso al check-in
   - Si no es válido, mostrar error

---

**Última actualización**: 2025-12-14
**Commit**: 518fdfe - feat: Add check-in QR code and access link functionality
