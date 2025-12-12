/**
 * Hook para gestionar notificaciones de karaoke
 * Incluye Browser Notifications, Audio y Vibración (100% gratis)
 */
export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    playSound?: boolean;
    vibrate?: boolean;
}
/**
 * Hook para gestionar notificaciones del navegador
 */
export declare function useKaraokeNotifications(): {
    showNotification: (options: NotificationOptions) => Promise<boolean>;
    notifyYourTurn: (songTitle: string, artist?: string) => Promise<boolean>;
    requestPermission: () => Promise<boolean>;
    hasPermission: boolean;
};
//# sourceMappingURL=useKaraokeNotifications.d.ts.map