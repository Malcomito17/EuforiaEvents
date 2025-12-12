"use strict";
/**
 * Messages Service
 * Sistema de mensajes configurables con soporte multi-idioma
 *
 * Características:
 * - Mensajes por defecto desde JSON
 * - Override por evento vía customMessages en DB
 * - Soporte de placeholders (ej: {seconds}, {max})
 * - Multi-idioma (es, en, formal)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultMessages = getDefaultMessages;
exports.getMessage = getMessage;
exports.replacePlaceholders = replacePlaceholders;
exports.getMessageWithValues = getMessageWithValues;
const messages_json_1 = __importDefault(require("../config/messages.json"));
// ============================================
// Default Messages
// ============================================
/**
 * Obtiene los mensajes por defecto de un módulo
 */
function getDefaultMessages(module, language = 'es') {
    const languageMessages = messages_json_1.default[language];
    if (!languageMessages) {
        console.warn(`[MESSAGES] Idioma "${language}" no encontrado, usando "es"`);
        return {
            common: messages_json_1.default.es.common,
            ...messages_json_1.default.es[module]
        };
    }
    return {
        common: languageMessages.common,
        ...languageMessages[module]
    };
}
/**
 * Obtiene un mensaje específico por path (ej: "search.placeholder")
 */
function getMessage(module, path, language = 'es', customMessages) {
    // 1. Cargar mensajes por defecto
    const defaultMessages = getDefaultMessages(module, language);
    // 2. Mergear con customMessages si existen
    let messages = defaultMessages;
    if (customMessages) {
        try {
            const custom = JSON.parse(customMessages);
            messages = deepMerge(defaultMessages, custom);
        }
        catch (error) {
            console.error('[MESSAGES] Error al parsear customMessages:', error);
        }
    }
    // 3. Navegar el path (ej: "search.placeholder")
    const parts = path.split('.');
    let result = messages;
    for (const part of parts) {
        if (result && typeof result === 'object' && part in result) {
            result = result[part];
        }
        else {
            console.warn(`[MESSAGES] Path "${path}" no encontrado en ${module}.${language}`);
            return path; // Retornar el path como fallback
        }
    }
    return typeof result === 'string' ? result : path;
}
/**
 * Reemplaza placeholders en un mensaje
 * Ejemplo: replacePlaceholders("Espera {seconds} segundos", { seconds: 30 })
 *          -> "Espera 30 segundos"
 */
function replacePlaceholders(message, values) {
    let result = message;
    for (const [key, value] of Object.entries(values)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
}
/**
 * Obtiene un mensaje completo con placeholders reemplazados
 */
function getMessageWithValues(module, path, values, language = 'es', customMessages) {
    const message = getMessage(module, path, language, customMessages);
    return replacePlaceholders(message, values);
}
// ============================================
// Helpers
// ============================================
/**
 * Merge profundo de dos objetos
 */
function deepMerge(target, source) {
    if (typeof target !== 'object' || typeof source !== 'object') {
        return source;
    }
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        }
        else {
            result[key] = source[key];
        }
    }
    return result;
}
//# sourceMappingURL=messages.service.js.map