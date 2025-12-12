/**
 * Guest Store - Manejo de identificación y persistencia (v1.3)
 */
import type { Guest } from '../types';
interface GuestStore {
    guest: Guest | null;
    isIdentifying: boolean;
    error: string | null;
    identifyGuest: (email: string, displayName: string, whatsapp?: string) => Promise<void>;
    clearGuest: () => void;
    updateGuestFromStorage: () => void;
}
export declare const useGuestStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<GuestStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<GuestStore, {
            guest: any;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: GuestStore) => void) => () => void;
        onFinishHydration: (fn: (state: GuestStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<GuestStore, {
            guest: any;
        }>>;
    };
}>;
export {};
//# sourceMappingURL=guestStore.d.ts.map