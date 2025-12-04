/**
 * QR Code Generator Utility
 * Genera códigos QR para acceso a eventos
 */

import QRCode from 'qrcode';
import { env } from '../../config/env';

// ============================================
// TYPES
// ============================================

export interface QRGenerateOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

export interface QRResult {
  dataUrl: string;      // Base64 data URL (para <img src="">)
  svg: string;          // SVG string
  url: string;          // URL que codifica el QR
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_OPTIONS: QRGenerateOptions = {
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
 */
export function generateEventUrl(slug: string): string {
  const baseUrl = env.CLIENT_URL || 'http://localhost:5173';
  return `${baseUrl}/e/${slug}`;
}

/**
 * Genera QR code en múltiples formatos
 */
export async function generateQRCode(
  data: string,
  options: QRGenerateOptions = {}
): Promise<QRResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.darkColor!,
      light: opts.lightColor!,
    },
    errorCorrectionLevel: 'M',
  };

  // Generar Data URL (PNG base64)
  const dataUrl = await QRCode.toDataURL(data, qrOptions);

  // Generar SVG
  const svg = await QRCode.toString(data, {
    type: 'svg',
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.darkColor!,
      light: opts.lightColor!,
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
export async function generateEventQR(
  slug: string,
  options?: QRGenerateOptions
): Promise<QRResult> {
  const eventUrl = generateEventUrl(slug);
  return generateQRCode(eventUrl, options);
}

/**
 * Genera QR como buffer PNG (para descarga directa)
 */
export async function generateQRBuffer(
  data: string,
  options: QRGenerateOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return QRCode.toBuffer(data, {
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.darkColor!,
      light: opts.lightColor!,
    },
    errorCorrectionLevel: 'M',
  });
}
