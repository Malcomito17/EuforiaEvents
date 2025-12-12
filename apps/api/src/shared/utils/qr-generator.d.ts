/**
 * QR Code Generator Utility
 * Genera códigos QR para acceso a eventos
 */
export interface QRGenerateOptions {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
}
export interface QRResult {
    dataUrl: string;
    svg: string;
    url: string;
}
/**
 * Genera la URL de acceso público para un evento
 * Prioridad: PUBLIC_DOMAIN (producción) > CLIENT_URL (desarrollo) > localhost
 */
export declare function generateEventUrl(slug: string): string;
/**
 * Genera QR code en múltiples formatos
 */
export declare function generateQRCode(data: string, options?: QRGenerateOptions): Promise<QRResult>;
/**
 * Genera QR para un evento específico
 */
export declare function generateEventQR(slug: string, options?: QRGenerateOptions): Promise<QRResult>;
/**
 * Genera QR como buffer PNG (para descarga directa)
 */
export declare function generateQRBuffer(data: string, options?: QRGenerateOptions): Promise<Buffer>;
//# sourceMappingURL=qr-generator.d.ts.map