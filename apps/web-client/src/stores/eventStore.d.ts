/**
 * Event Store - Estado global del evento actual
 */
import type { Event, MusicadjConfig, KaraokeyaConfig } from '../types';
interface EventState {
    event: Event | null;
    musicadjConfig: MusicadjConfig | null;
    karaokeyaConfig: KaraokeyaConfig | null;
    loading: boolean;
    error: string | null;
    loadEvent: (slug: string) => Promise<void>;
    reset: () => void;
}
export declare const useEventStore: import("zustand").UseBoundStore<import("zustand").StoreApi<EventState>>;
export {};
//# sourceMappingURL=eventStore.d.ts.map