/**
 * Notifications Service
 * Envía notificaciones por WhatsApp/SMS usando Twilio
 */
/**
 * Verifica si Twilio está configurado
 */
export declare function isTwilioConfigured(): boolean;
/**
 * Verifica si WhatsApp está configurado
 */
export declare function isWhatsAppConfigured(): boolean;
/**
 * Verifica si SMS está configurado
 */
export declare function isSMSConfigured(): boolean;
export interface NotificationResult {
    success: boolean;
    method?: 'whatsapp' | 'sms' | 'none';
    messageId?: string;
    error?: string;
}
export interface SendNotificationInput {
    phoneNumber: string;
    message: string;
    preferWhatsApp?: boolean;
}
/**
 * Envía una notificación por WhatsApp
 */
export declare function sendWhatsAppNotification(phoneNumber: string, message: string): Promise<NotificationResult>;
/**
 * Envía una notificación por SMS
 */
export declare function sendSMSNotification(phoneNumber: string, message: string): Promise<NotificationResult>;
/**
 * Envía notificación con sistema de fallback inteligente
 * 1. Intenta WhatsApp primero (si está configurado y preferido)
 * 2. Si falla, intenta SMS (si está configurado)
 */
export declare function sendNotification(input: SendNotificationInput): Promise<NotificationResult>;
export declare class NotificationError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=notifications.service.d.ts.map