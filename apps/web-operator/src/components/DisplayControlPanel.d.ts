/**
 * Display Control Panel - Controles para gestionar la pantalla Display
 */
interface DisplayConfig {
    displayMode: 'QUEUE' | 'BREAK' | 'START' | 'PROMO';
    displayLayout: 'VERTICAL' | 'HORIZONTAL';
    displayBreakMessage: string;
    displayStartMessage: string;
    displayPromoImageUrl: string | null;
}
interface DisplayControlPanelProps {
    eventId: string;
    eventSlug: string;
    config: DisplayConfig;
    onConfigUpdate: (config: Partial<DisplayConfig>) => Promise<void>;
}
export declare function DisplayControlPanel({ eventSlug, config, onConfigUpdate }: DisplayControlPanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DisplayControlPanel.d.ts.map