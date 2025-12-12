"use strict";
/**
 * EUFORIA EVENTS - Events Module Exports
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = exports.eventController = exports.EventError = exports.eventService = void 0;
var events_service_1 = require("./events.service");
Object.defineProperty(exports, "eventService", { enumerable: true, get: function () { return events_service_1.eventService; } });
Object.defineProperty(exports, "EventError", { enumerable: true, get: function () { return events_service_1.EventError; } });
var events_controller_1 = require("./events.controller");
Object.defineProperty(exports, "eventController", { enumerable: true, get: function () { return events_controller_1.eventController; } });
var events_routes_1 = require("./events.routes");
Object.defineProperty(exports, "eventRoutes", { enumerable: true, get: function () { return __importDefault(events_routes_1).default; } });
__exportStar(require("./events.types"), exports);
//# sourceMappingURL=index.js.map