import { Request, Response, NextFunction } from 'express'
import * as guestService from './guest.service'
import { identifyGuestSchema, GuestError } from './guest.types'

export async function identify(req: Request, res: Response, next: NextFunction) {
  try {
    const input = identifyGuestSchema.parse(req.body)
    const guest = await guestService.identifyGuest(input)
    res.json(guest)
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { guestId } = req.params
    const guest = await guestService.getGuestById(guestId)
    res.json(guest)
  } catch (error) {
    next(error)
  }
}

export async function getByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query
    if (!email || typeof email !== 'string') {
      throw new GuestError('Email requerido', 400)
    }
    const guest = await guestService.getGuestByEmail(email)
    if (!guest) {
      res.status(404).json({ error: 'Guest no encontrado' })
      return
    }
    res.json(guest)
  } catch (error) {
    next(error)
  }
}

export async function getRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { guestId } = req.params
    const { eventId } = req.query
    const requests = await guestService.getGuestRequests(
      guestId, 
      typeof eventId === 'string' ? eventId : undefined
    )
    res.json(requests)
  } catch (error) {
    next(error)
  }
}
