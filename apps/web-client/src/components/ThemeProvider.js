/**
 * ThemeProvider - Aplica colores personalizados del evento usando CSS variables
 */
import { useEffect } from 'react';
import { useEventStore } from '../stores/eventStore';
export function ThemeProvider({ children }) {
    const { event } = useEventStore();
    useEffect(() => {
        console.log('[ThemeProvider] Event changed:', {
            hasEvent: !!event,
            hasEventData: !!event?.eventData,
            eventData: event?.eventData
        });
        if (event?.eventData) {
            const root = document.documentElement;
            // Aplicar colores personalizados o usar defaults
            const primary = event.eventData.primaryColor || '#7C3AED';
            const secondary = event.eventData.secondaryColor || '#EC4899';
            const accent = event.eventData.accentColor || '#F59E0B';
            console.log('[ThemeProvider] Applying colors:', { primary, secondary, accent });
            // Función para convertir hex a RGB
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : { r: 124, g: 58, b: 237 };
            };
            const primaryRgb = hexToRgb(primary);
            // Establecer colores principales en formato hex (para compatibilidad)
            root.style.setProperty('--color-primary', primary);
            root.style.setProperty('--color-secondary', secondary);
            root.style.setProperty('--color-accent', accent);
            // Establecer variantes usando RGB con diferentes opacidades
            const adjustBrightness = (r, g, b, factor) => {
                return `rgb(${Math.round(r + (255 - r) * factor)}, ${Math.round(g + (255 - g) * factor)}, ${Math.round(b + (255 - b) * factor)})`;
            };
            const adjustDarkness = (r, g, b, factor) => {
                return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
            };
            // Variantes claras (50-400)
            root.style.setProperty('--color-primary-50', adjustBrightness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.95));
            root.style.setProperty('--color-primary-100', adjustBrightness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.9));
            root.style.setProperty('--color-primary-200', adjustBrightness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.7));
            root.style.setProperty('--color-primary-300', adjustBrightness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.5));
            root.style.setProperty('--color-primary-400', adjustBrightness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.3));
            // Color base (500-600)
            root.style.setProperty('--color-primary-500', `rgb(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b})`);
            root.style.setProperty('--color-primary-600', `rgb(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b})`);
            // Variantes oscuras (700-900)
            root.style.setProperty('--color-primary-700', adjustDarkness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.85));
            root.style.setProperty('--color-primary-800', adjustDarkness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.7));
            root.style.setProperty('--color-primary-900', adjustDarkness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.55));
        }
    }, [event]);
    return <>{children}</>;
}
//# sourceMappingURL=ThemeProvider.js.map