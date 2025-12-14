/**
 * Upload Service - Manejo de archivos con multer
 */

import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

// Directorio base para uploads
const UPLOADS_DIR = path.join(__dirname, '../../../public/uploads')

// Asegurar que existen los directorios
const ensureDirectories = () => {
  const dirs = [
    UPLOADS_DIR,
    path.join(UPLOADS_DIR, 'events'),
    path.join(UPLOADS_DIR, 'karaokeya')
  ]

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`[UPLOAD] Directorio creado: ${dir}`)
    }
  })
}

ensureDirectories()

// Configuración de storage
const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    const uploadType = req.body.uploadType || 'events'
    const dest = path.join(UPLOADS_DIR, uploadType)
    cb(null, dest)
  },
  filename: function (req: Request, file, cb) {
    // Generar nombre único: timestamp-random-extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

// Filtro de archivos (solo imágenes)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Formato de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP)'))
  }
}

// Configuración de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
})

/**
 * Elimina un archivo del servidor
 */
export function deleteFile(fileUrl: string): boolean {
  try {
    // Extraer path relativo de la URL (/uploads/events/123.jpg)
    const relativePath = fileUrl.replace(/^\//, '') // Quitar / inicial
    const filePath = path.join(__dirname, '../../../public', relativePath)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`[UPLOAD] Archivo eliminado: ${filePath}`)
      return true
    }
    return false
  } catch (error) {
    console.error('[UPLOAD] Error al eliminar archivo:', error)
    return false
  }
}

/**
 * Construye la URL pública del archivo
 */
export function getPublicUrl(filename: string, uploadType: string = 'events'): string {
  return `/uploads/${uploadType}/${filename}`
}
