"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestIdentifySchema = void 0;
const zod_1 = require("zod");
// Schema de validación para identificación de guest
exports.guestIdentifySchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    displayName: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
    whatsapp: zod_1.z.string().optional(),
});
//# sourceMappingURL=guests.types.js.map