/**
 * ClientHeader - Header reutilizable para páginas del cliente
 * Muestra nombre del evento, notificación de turno, y navegación
 */
interface ClientHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    backTo?: string;
    showTurnNotification?: boolean;
}
export declare function ClientHeader({ title, subtitle, showBackButton, backTo, showTurnNotification, }: ClientHeaderProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ClientHeader.d.ts.map