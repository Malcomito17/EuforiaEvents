/**
 * Messages Service
 * Sistema de mensajes configurables con soporte multi-idioma
 *
 * Características:
 * - Mensajes por defecto desde JSON
 * - Override por evento vía customMessages en DB
 * - Soporte de placeholders (ej: {seconds}, {max})
 * - Multi-idioma (es, en, formal)
 */

import messagesJson from '../config/messages.json'

// ============================================
// Types
// ============================================

type ModuleName = 'musicadj' | 'karaokeya'
type LanguageCode = 'es' | 'en' | 'formal'

interface MessagesConfig {
  [key: string]: string | MessagesConfig
}

interface ModuleMessages {
  common?: MessagesConfig
  [key: string]: any
}

// ============================================
// Default Messages
// ============================================

/**
 * Obtiene los mensajes por defecto de un módulo
 */
export function getDefaultMessages(
  module: ModuleName,
  language: LanguageCode = 'es'
): ModuleMessages {
  const languageMessages = messagesJson[language]

  if (!languageMessages) {
    console.warn(`[MESSAGES] Idioma "${language}" no encontrado, usando "es"`)
    return {
      common: messagesJson.es.common,
      ...messagesJson.es[module]
    }
  }

  return {
    common: languageMessages.common,
    ...languageMessages[module]
  }
}

/**
 * Obtiene un mensaje específico por path (ej: "search.placeholder")
 */
export function getMessage(
  module: ModuleName,
  path: string,
  language: LanguageCode = 'es',
  customMessages?: string | null
): string {
  // 1. Cargar mensajes por defecto
  const defaultMessages = getDefaultMessages(module, language)

  // 2. Mergear con customMessages si existen
  let messages = defaultMessages
  if (customMessages) {
    try {
      const custom = JSON.parse(customMessages)
      messages = deepMerge(defaultMessages, custom)
    } catch (error) {
      console.error('[MESSAGES] Error al parsear customMessages:', error)
    }
  }

  // 3. Navegar el path (ej: "search.placeholder")
  const parts = path.split('.')
  let result: any = messages

  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part]
    } else {
      console.warn(`[MESSAGES] Path "${path}" no encontrado en ${module}.${language}`)
      return path // Retornar el path como fallback
    }
  }

  return typeof result === 'string' ? result : path
}

/**
 * Reemplaza placeholders en un mensaje
 * Ejemplo: replacePlaceholders("Espera {seconds} segundos", { seconds: 30 })
 *          -> "Espera 30 segundos"
 */
export function replacePlaceholders(
  message: string,
  values: Record<string, string | number>
): string {
  let result = message

  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }

  return result
}

/**
 * Obtiene un mensaje completo con placeholders reemplazados
 */
export function getMessageWithValues(
  module: ModuleName,
  path: string,
  values: Record<string, string | number>,
  language: LanguageCode = 'es',
  customMessages?: string | null
): string {
  const message = getMessage(module, path, language, customMessages)
  return replacePlaceholders(message, values)
}

// ============================================
// Helpers
// ============================================

/**
 * Merge profundo de dos objetos
 */
function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || typeof source !== 'object') {
    return source
  }

  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

// ============================================
// Exports
// ============================================

export type { ModuleName, LanguageCode, MessagesConfig, ModuleMessages }
