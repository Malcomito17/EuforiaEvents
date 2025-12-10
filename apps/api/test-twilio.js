/**
 * Script de prueba para Twilio
 * Verifica que las credenciales funcionan y puede enviar un mensaje de WhatsApp
 */

require('dotenv').config()
const twilio = require('twilio')

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

console.log('🔍 Verificando configuración de Twilio...\n')

console.log('Account SID:', TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ Falta')
console.log('Auth Token:', TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ Falta')
console.log('WhatsApp Number:', TWILIO_WHATSAPP_NUMBER || '❌ Falta')
console.log('')

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
  console.error('❌ Faltan credenciales de Twilio en el .env')
  process.exit(1)
}

console.log('📱 Ingresa el número de WhatsApp al que quieres enviar el mensaje de prueba')
console.log('   (Formato: +54911XXXXXXXX o 11XXXXXXXX)')
console.log('   IMPORTANTE: Este número debe haber enviado "join <palabra>" al sandbox de Twilio\n')

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question('Número de destino: ', async (phoneNumber) => {
  readline.close()

  if (!phoneNumber) {
    console.error('❌ Debes ingresar un número de teléfono')
    process.exit(1)
  }

  try {
    console.log('\n🚀 Inicializando cliente de Twilio...')
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    console.log('📤 Enviando mensaje de prueba...')

    // Normalizar número
    let normalizedPhone = phoneNumber.replace(/[^\d+]/g, '')
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.startsWith('54')) {
        normalizedPhone = '+' + normalizedPhone
      } else if (normalizedPhone.startsWith('9')) {
        normalizedPhone = '+54' + normalizedPhone
      } else {
        normalizedPhone = '+549' + normalizedPhone
      }
    }

    console.log(`📞 Número normalizado: ${normalizedPhone}`)

    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${normalizedPhone}`,
      body: '🎤 ¡Prueba de Euforia Events! Si recibiste este mensaje, Twilio está configurado correctamente. ✅'
    })

    console.log('\n✅ Mensaje enviado exitosamente!')
    console.log('📋 SID del mensaje:', message.sid)
    console.log('📊 Estado:', message.status)
    console.log('\n💡 Revisa tu WhatsApp, deberías recibir el mensaje en unos segundos.')

  } catch (error) {
    console.error('\n❌ Error al enviar mensaje:')
    console.error('Código:', error.code)
    console.error('Mensaje:', error.message)

    if (error.code === 21211) {
      console.error('\n💡 El número no está verificado en el sandbox de Twilio.')
      console.error('   Solución: Envía "join <palabra>" al número del sandbox desde WhatsApp')
    } else if (error.code === 21608) {
      console.error('\n💡 El número no existe o está en formato incorrecto.')
      console.error('   Verifica que sea un número válido de WhatsApp')
    } else if (error.code === 20003) {
      console.error('\n💡 Credenciales inválidas.')
      console.error('   Verifica tu TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN')
    }
  }
})
