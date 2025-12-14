/**
 * Upload Controller - Endpoints para subir imágenes
 */

import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { getPublicUrl, deleteFile } from '../../shared/services/upload.service'

const prisma = new PrismaClient()

/**
 * POST /api/events/:eventId/upload-image
 * Sube una imagen para el evento
 */
export async function uploadEventImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' })
    }

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { eventData: true }
    })

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    // Eliminar imagen anterior si existe
    if (event.eventData?.eventImage) {
      deleteFile(event.eventData.eventImage)
    }

    // Construir URL pública
    const imageUrl = getPublicUrl(req.file.filename, 'events')

    // Actualizar o crear eventData con la nueva imagen
    if (event.eventData) {
      await prisma.eventData.update({
        where: { id: event.eventData.id },
        data: { eventImage: imageUrl }
      })
    } else {
      // Crear eventData si no existe (no debería pasar pero por seguridad)
      await prisma.eventData.create({
        data: {
          eventId,
          eventName: 'Sin nombre',
          startDate: new Date(),
          eventImage: imageUrl
        }
      })
    }

    console.log(`[UPLOAD] Imagen de evento subida: ${imageUrl}`)

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/events/:eventId/delete-image
 * Elimina la imagen del evento
 */
export async function deleteEventImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { eventData: true }
    })

    if (!event || !event.eventData?.eventImage) {
      return res.status(404).json({ error: 'No hay imagen para eliminar' })
    }

    // Eliminar archivo físico
    deleteFile(event.eventData.eventImage)

    // Actualizar BD
    await prisma.eventData.update({
      where: { id: event.eventData.id },
      data: { eventImage: null }
    })

    console.log(`[UPLOAD] Imagen de evento eliminada`)

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/events/:eventId/karaokeya/upload-promo
 * Sube una imagen promocional para el display de karaokeya
 */
export async function uploadKaraokeyaPromoImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' })
    }

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { karaokeyaConfig: true }
    })

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    // Eliminar imagen anterior si existe
    if (event.karaokeyaConfig?.displayPromoImageUrl) {
      deleteFile(event.karaokeyaConfig.displayPromoImageUrl)
    }

    // Construir URL pública
    const imageUrl = getPublicUrl(req.file.filename, 'karaokeya')

    // Actualizar o crear config con la nueva imagen
    if (event.karaokeyaConfig) {
      await prisma.karaokeyaConfig.update({
        where: { eventId },
        data: { displayPromoImageUrl: imageUrl }
      })
    } else {
      // Crear config si no existe
      await prisma.karaokeyaConfig.create({
        data: {
          eventId,
          displayPromoImageUrl: imageUrl
        }
      })
    }

    console.log(`[UPLOAD] Imagen promo de karaokeya subida: ${imageUrl}`)

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/events/:eventId/karaokeya/delete-promo
 * Elimina la imagen promocional de karaokeya
 */
export async function deleteKaraokeyaPromoImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params

    const config = await prisma.karaokeyaConfig.findUnique({
      where: { eventId }
    })

    if (!config || !config.displayPromoImageUrl) {
      return res.status(404).json({ error: 'No hay imagen para eliminar' })
    }

    // Eliminar archivo físico
    deleteFile(config.displayPromoImageUrl)

    // Actualizar BD
    await prisma.karaokeyaConfig.update({
      where: { eventId },
      data: { displayPromoImageUrl: null }
    })

    console.log(`[UPLOAD] Imagen promo de karaokeya eliminada`)

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
