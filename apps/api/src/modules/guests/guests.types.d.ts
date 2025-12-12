import { z } from 'zod';
export declare const guestIdentifySchema: z.ZodObject<{
    email: z.ZodString;
    displayName: z.ZodString;
    whatsapp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    displayName: string;
    whatsapp?: string | undefined;
}, {
    email: string;
    displayName: string;
    whatsapp?: string | undefined;
}>;
export type GuestIdentifyInput = z.infer<typeof guestIdentifySchema>;
export interface GuestResponse {
    id: string;
    email: string;
    displayName: string;
    whatsapp?: string | null;
    createdAt: Date;
}
//# sourceMappingURL=guests.types.d.ts.map