# Configuración de Twilio (Opcional)

⚠️ **IMPORTANTE**: Las notificaciones del navegador funcionan **SIN** Twilio. Esta configuración es completamente opcional y solo necesaria si quieres enviar notificaciones por WhatsApp/SMS.

## ¿Qué funciona SIN Twilio?

✅ **Browser Notifications** - Notificaciones del navegador
✅ **Audio Alerts** - Sonido de alerta
✅ **Vibración** - Vibración del dispositivo móvil

Todo esto es **100% gratis** y no requiere configuración adicional.

## ¿Por qué configurar Twilio? (Opcional)

Con Twilio puedes enviar notificaciones **incluso si el usuario no está en la página web**:

- 📱 **WhatsApp**: Mensaje directo al teléfono (~$0.005 USD por mensaje)
- 📧 **SMS**: Mensaje de texto tradicional (~$0.01-0.08 USD por mensaje)

## Paso 1: Crear cuenta Twilio

1. Ve a https://www.twilio.com/try-twilio
2. Regístrate (te dan **$15 USD gratis** para probar)
3. Verifica tu email y número de teléfono

## Paso 2: Obtener credenciales

1. Una vez en el **Dashboard de Twilio**, encontrarás:
   - **Account SID**: Un código como `ACxxxxxxxxxxxxx`
   - **Auth Token**: Click en "Show" para verlo

2. Copia ambos valores

## Paso 3: Configurar WhatsApp (Desarrollo)

Para desarrollo, Twilio ofrece un **Sandbox gratuito**:

1. En el Dashboard, ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Sigue las instrucciones:
   - Abre WhatsApp en tu teléfono
   - Envía el mensaje que te indica (ej: `join <palabra-clave>`)
   - Al número que te muestra Twilio
3. Anota el **número del sandbox** (formato: `whatsapp:+14155238886`)

### Para Producción (WhatsApp Business)

Si quieres usar WhatsApp en producción real:

1. Ve a **Messaging** → **Senders** → **WhatsApp senders**
2. Click en **Request to enable your Twilio number for WhatsApp**
3. Sigue el proceso de aprobación (1-2 semanas)
4. Costo: ~$1-5 USD/mes por número

## Paso 4: Configurar SMS (Opcional)

1. Ve a **Phone Numbers** → **Manage** → **Buy a number**
2. Busca un número que soporte **SMS**
3. En trial: gratis | En producción: ~$1 USD/mes
4. Anota el número (formato: `+14155551234`)

## Paso 5: Agregar variables al `.env`

1. Abre el archivo `apps/api/.env`
2. Agrega las credenciales:

```bash
# Twilio - Notificaciones WhatsApp/SMS (Opcional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_SMS_NUMBER=+14155551234
```

3. **Reinicia el servidor** de la API:
```bash
cd apps/api
pnpm dev
```

## Paso 6: Probar las notificaciones

1. Asegúrate de que el **guest tenga un número de WhatsApp** registrado en la BD
2. Cambia el status de una solicitud de karaoke a **CALLED** desde el panel de operador
3. Deberías recibir:
   - ✅ Browser notification (siempre)
   - ✅ Sonido + vibración (siempre)
   - ✅ Mensaje de WhatsApp (solo si Twilio está configurado)

## Costos estimados

### Modo Trial (Gratis)
- $15 USD de crédito gratis
- Funciona con números verificados
- Perfecto para desarrollo

### Modo Producción
- WhatsApp: ~$0.005 USD por mensaje
- SMS: ~$0.01-0.08 USD por mensaje (según país)
- Número de teléfono: ~$1 USD/mes
- Sin costos fijos mensuales

**Ejemplo**: 100 notificaciones/mes por WhatsApp = $0.50 USD/mes

## Troubleshooting

### Error: "Twilio no está configurado"
- Verifica que las 4 variables estén en el `.env`
- Reinicia el servidor de la API

### Error: "The number +54xxxxxxx is unverified"
- En modo trial, solo puedes enviar a números **verificados**
- Ve a **Phone Numbers** → **Manage** → **Verified Caller IDs**
- Agrega los números de prueba

### No recibo mensajes de WhatsApp
- Verifica que enviaste el mensaje `join <palabra>` al sandbox
- Revisa el console del servidor para logs de Twilio
- El número debe estar en formato internacional (+54...)

## ¿Qué hacer si no quiero usar Twilio?

¡Nada! El sistema funciona perfectamente sin Twilio. Solo usa las **Browser Notifications** que son gratis y funcionan muy bien para eventos donde los usuarios están atentos a sus dispositivos.
