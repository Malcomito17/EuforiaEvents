import { Request, Response, NextFunction } from 'express'
import * as service from './users.service'

// ============================================
// CRUD CONTROLLERS
// ============================================

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listUsers(req.query)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.getUserById(req.params.userId)
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.createUser(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.updateUser(req.params.userId, req.body)
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function updatePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.updateUserPermissions(req.params.userId, req.body.permissions)
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteUser(req.params.userId)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function reactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.reactivateUser(req.params.userId)
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function getRolePresets(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.params
    const permissions = service.getRolePreset(role)
    res.json({ role, permissions })
  } catch (error) {
    next(error)
  }
}

// ============================================
// ERROR HANDLER
// ============================================

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.name === 'UsersError') {
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  console.error('[USERS ERROR]', err)
  res.status(500).json({ error: 'Error interno del servidor' })
}
