"use strict";
/**
 * EUFORIA EVENTS - Venues Module Exports
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueRoutes = exports.venueController = exports.VENUE_TYPE = exports.VenueError = exports.venueService = void 0;
var venues_service_1 = require("./venues.service");
Object.defineProperty(exports, "venueService", { enumerable: true, get: function () { return venues_service_1.venueService; } });
Object.defineProperty(exports, "VenueError", { enumerable: true, get: function () { return venues_service_1.VenueError; } });
Object.defineProperty(exports, "VENUE_TYPE", { enumerable: true, get: function () { return venues_service_1.VENUE_TYPE; } });
var venues_controller_1 = require("./venues.controller");
Object.defineProperty(exports, "venueController", { enumerable: true, get: function () { return venues_controller_1.venueController; } });
var venues_routes_1 = require("./venues.routes");
Object.defineProperty(exports, "venueRoutes", { enumerable: true, get: function () { return __importDefault(venues_routes_1).default; } });
//# sourceMappingURL=index.js.map