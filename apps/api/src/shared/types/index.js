"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIOFromRequest = getIOFromRequest;
/**
 * Helper para obtener io desde un request
 */
function getIOFromRequest(req) {
    return req.app.get('io');
}
//# sourceMappingURL=index.js.map