"use strict";
/**
 * QR Code Generator Utility
 * Genera códigos QR para acceso a eventos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEventUrl = generateEventUrl;
exports.generateQRCode = generateQRCode;
exports.generateEventQR = generateEventQR;
exports.generateQRBuffer = generateQRBuffer;
const qrcode_1 = __importDefault(require("qrcode"));
const env_1 = require("../../config/env");
// ============================================
// CONSTANTS
// ============================================
const DEFAULT_OPTIONS = {
    width: 300,
    margin: 2,
    darkColor: '#000000',
    lightColor: '#ffffff',
};
// ============================================
// QR GENERATOR
// ============================================
/**
 * Genera la URL de acceso público para un evento
 * Prioridad: PUBLIC_DOMAIN (producción) > CLIENT_URL (desarrollo) > localhost
 */
function generateEventUrl(slug) {
    // Usar PUBLIC_DOMAIN si está configurado (producción con Cloudflare Tunnel)
    // Fallback a CLIENT_URL (desarrollo local)
    // Fallback final a localhost
    const baseUrl = env_1.env.PUBLIC_DOMAIN || env_1.env.CLIENT_URL || 'http://localhost:5173';
    return `${baseUrl}/e/${slug}`;
}
/**
 * Genera QR code en múltiples formatos
 */
async function generateQRCode(data, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const qrOptions = {
        width: opts.width,
        margin: opts.margin,
        color: {
            dark: opts.darkColor,
            light: opts.lightColor,
        },
        errorCorrectionLevel: 'M',
    };
    // Generar Data URL (PNG base64)
    const dataUrl = await qrcode_1.default.toDataURL(data, qrOptions);
    // Generar SVG
    const svg = await qrcode_1.default.toString(data, {
        type: 'svg',
        width: opts.width,
        margin: opts.margin,
        color: {
            dark: opts.darkColor,
            light: opts.lightColor,
        },
        errorCorrectionLevel: 'M',
    });
    return {
        dataUrl,
        svg,
        url: data,
    };
}
/**
 * Genera QR para un evento específico
 */
async function generateEventQR(slug, options) {
    const eventUrl = generateEventUrl(slug);
    return generateQRCode(eventUrl, options);
}
/**
 * Genera QR como buffer PNG (para descarga directa)
 */
async function generateQRBuffer(data, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    return qrcode_1.default.toBuffer(data, {
        width: opts.width,
        margin: opts.margin,
        color: {
            dark: opts.darkColor,
            light: opts.lightColor,
        },
        errorCorrectionLevel: 'M',
    });
}
//# sourceMappingURL=qr-generator.js.map