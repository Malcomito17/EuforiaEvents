"use strict";
/**
 * Notifications Service
 * Envía notificaciones por WhatsApp/SMS usando Twilio
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationError = void 0;
exports.isTwilioConfigured = isTwilioConfigured;
exports.isWhatsAppConfigured = isWhatsAppConfigured;
exports.isSMSConfigured = isSMSConfigured;
exports.sendWhatsAppNotification = sendWhatsAppNotification;
exports.sendSMSNotification = sendSMSNotification;
exports.sendNotification = sendNotification;
const twilio_1 = __importDefault(require("twilio"));
// ============================================
// Configuración de Twilio
// ============================================
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const TWILIO_SMS_NUMBER = process.env.TWILIO_SMS_NUMBER;
let twilioClient = null;
/**
 * Verifica si Twilio está configurado
 */
function isTwilioConfigured() {
    return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN);
}
/**
 * Verifica si WhatsApp está configurado
 */
function isWhatsAppConfigured() {
    return isTwilioConfigured() && !!TWILIO_WHATSAPP_NUMBER;
}
/**
 * Verifica si SMS está configurado
 */
function isSMSConfigured() {
    return isTwilioConfigured() && !!TWILIO_SMS_NUMBER;
}
/**
 * Inicializa el cliente de Twilio (lazy initialization)
 */
function getTwilioClient() {
    if (!isTwilioConfigured()) {
        throw new NotificationError('Twilio no está configurado', 503);
    }
    if (!twilioClient) {
        twilioClient = (0, twilio_1.default)(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        console.log('[TWILIO] Cliente inicializado');
    }
    return twilioClient;
}
// ============================================
// Funciones de Envío
// ============================================
/**
 * Envía una notificación por WhatsApp
 */
async function sendWhatsAppNotification(phoneNumber, message) {
    if (!isWhatsAppConfigured()) {
        return {
            success: false,
            method: 'none',
            error: 'WhatsApp no configurado'
        };
    }
    try {
        const client = getTwilioClient();
        // Normalizar número de teléfono
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        const twilioMessage = await client.messages.create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${normalizedPhone}`,
            body: message
        });
        console.log(`[WHATSAPP] Mensaje enviado a ${normalizedPhone}. SID: ${twilioMessage.sid}`);
        return {
            success: true,
            method: 'whatsapp',
            messageId: twilioMessage.sid
        };
    }
    catch (error) {
        console.error('[WHATSAPP] Error:', error.message);
        return {
            success: false,
            method: 'whatsapp',
            error: error.message
        };
    }
}
/**
 * Envía una notificación por SMS
 */
async function sendSMSNotification(phoneNumber, message) {
    if (!isSMSConfigured()) {
        return {
            success: false,
            method: 'none',
            error: 'SMS no configurado'
        };
    }
    try {
        const client = getTwilioClient();
        // Normalizar número de teléfono
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        const twilioMessage = await client.messages.create({
            from: TWILIO_SMS_NUMBER,
            to: normalizedPhone,
            body: message
        });
        console.log(`[SMS] Mensaje enviado a ${normalizedPhone}. SID: ${twilioMessage.sid}`);
        return {
            success: true,
            method: 'sms',
            messageId: twilioMessage.sid
        };
    }
    catch (error) {
        console.error('[SMS] Error:', error.message);
        return {
            success: false,
            method: 'sms',
            error: error.message
        };
    }
}
/**
 * Envía notificación con sistema de fallback inteligente
 * 1. Intenta WhatsApp primero (si está configurado y preferido)
 * 2. Si falla, intenta SMS (si está configurado)
 */
async function sendNotification(input) {
    const { phoneNumber, message, preferWhatsApp = true } = input;
    // Validar número de teléfono
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        return {
            success: false,
            method: 'none',
            error: 'Número de teléfono inválido'
        };
    }
    // Intentar WhatsApp primero (si está configurado y es preferido)
    if (preferWhatsApp && isWhatsAppConfigured()) {
        const whatsappResult = await sendWhatsAppNotification(phoneNumber, message);
        if (whatsappResult.success) {
            return whatsappResult;
        }
        console.log(`[NOTIFICATIONS] WhatsApp falló, intentando SMS fallback...`);
    }
    // Fallback a SMS
    if (isSMSConfigured()) {
        return await sendSMSNotification(phoneNumber, message);
    }
    // Ningún método disponible
    return {
        success: false,
        method: 'none',
        error: 'Ni WhatsApp ni SMS están configurados'
    };
}
// ============================================
// Utilidades
// ============================================
/**
 * Normaliza un número de teléfono al formato internacional
 * Ejemplo:
 *   +54 9 11 1234-5678 -> +5491112345678
 *   11 1234-5678 -> +5491112345678
 */
function normalizePhoneNumber(phone) {
    // Remover todos los caracteres no numéricos excepto +
    let normalized = phone.replace(/[^\d+]/g, '');
    // Si empieza con +, está en formato internacional
    if (normalized.startsWith('+')) {
        return normalized;
    }
    // Si empieza con 54 (Argentina), agregar +
    if (normalized.startsWith('54')) {
        return `+${normalized}`;
    }
    // Si empieza con 9, asumir Argentina (54) + código de área 11
    if (normalized.startsWith('9')) {
        return `+54${normalized}`;
    }
    // Si es un número local argentino (11 XXXXXXXX), agregar código de país
    if (normalized.startsWith('11') && normalized.length >= 10) {
        return `+549${normalized}`;
    }
    // Por defecto, asumir que es Argentina
    return `+549${normalized}`;
}
/**
 * Valida que un número de teléfono sea válido
 */
function isValidPhoneNumber(phone) {
    if (!phone)
        return false;
    // Remover espacios y caracteres especiales
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Debe tener al menos 10 dígitos
    return cleaned.length >= 10;
}
// ============================================
// Error Class
// ============================================
class NotificationError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'NotificationError';
    }
}
exports.NotificationError = NotificationError;
//# sourceMappingURL=notifications.service.js.map