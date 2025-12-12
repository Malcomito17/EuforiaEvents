"use strict";
/**
 * EUFORIA EVENTS - Clients Module Exports
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRoutes = exports.clientController = exports.ClientError = exports.clientService = void 0;
var clients_service_1 = require("./clients.service");
Object.defineProperty(exports, "clientService", { enumerable: true, get: function () { return clients_service_1.clientService; } });
Object.defineProperty(exports, "ClientError", { enumerable: true, get: function () { return clients_service_1.ClientError; } });
var clients_controller_1 = require("./clients.controller");
Object.defineProperty(exports, "clientController", { enumerable: true, get: function () { return clients_controller_1.clientController; } });
var clients_routes_1 = require("./clients.routes");
Object.defineProperty(exports, "clientRoutes", { enumerable: true, get: function () { return __importDefault(clients_routes_1).default; } });
//# sourceMappingURL=index.js.map