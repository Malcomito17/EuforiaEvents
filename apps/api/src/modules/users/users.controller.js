"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updatePermissions = updatePermissions;
exports.deleteUser = deleteUser;
exports.reactivateUser = reactivateUser;
exports.getRolePresets = getRolePresets;
exports.errorHandler = errorHandler;
const service = __importStar(require("./users.service"));
// ============================================
// CRUD CONTROLLERS
// ============================================
async function listUsers(req, res, next) {
    try {
        const result = await service.listUsers(req.query);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getUser(req, res, next) {
    try {
        const user = await service.getUserById(req.params.userId);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function createUser(req, res, next) {
    try {
        const user = await service.createUser(req.body);
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
}
async function updateUser(req, res, next) {
    try {
        const user = await service.updateUser(req.params.userId, req.body);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function updatePermissions(req, res, next) {
    try {
        const user = await service.updateUserPermissions(req.params.userId, req.body.permissions);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function deleteUser(req, res, next) {
    try {
        const result = await service.deleteUser(req.params.userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function reactivateUser(req, res, next) {
    try {
        const user = await service.reactivateUser(req.params.userId);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function getRolePresets(req, res, next) {
    try {
        const { role } = req.params;
        const permissions = service.getRolePreset(role);
        res.json({ role, permissions });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// ERROR HANDLER
// ============================================
function errorHandler(err, req, res, next) {
    if (err.name === 'UsersError') {
        return res.status(err.statusCode).json({ error: err.message });
    }
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    console.error('[USERS ERROR]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
}
//# sourceMappingURL=users.controller.js.map