"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = exports.optionalAuth = exports.requireModuleAccess = exports.requireRole = exports.authenticate = exports.authController = exports.AuthError = exports.authService = void 0;
var auth_service_1 = require("./auth.service");
Object.defineProperty(exports, "authService", { enumerable: true, get: function () { return auth_service_1.authService; } });
Object.defineProperty(exports, "AuthError", { enumerable: true, get: function () { return auth_service_1.AuthError; } });
var auth_controller_1 = require("./auth.controller");
Object.defineProperty(exports, "authController", { enumerable: true, get: function () { return auth_controller_1.authController; } });
var auth_middleware_1 = require("./auth.middleware");
Object.defineProperty(exports, "authenticate", { enumerable: true, get: function () { return auth_middleware_1.authenticate; } });
Object.defineProperty(exports, "requireRole", { enumerable: true, get: function () { return auth_middleware_1.requireRole; } });
Object.defineProperty(exports, "requireModuleAccess", { enumerable: true, get: function () { return auth_middleware_1.requireModuleAccess; } });
Object.defineProperty(exports, "optionalAuth", { enumerable: true, get: function () { return auth_middleware_1.optionalAuth; } });
var auth_routes_1 = require("./auth.routes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
//# sourceMappingURL=index.js.map