/**
 * CSV Export Utility
 * Generación de archivos CSV con soporte para caracteres especiales
 */

export interface CsvColumn<T> {
  header: string
  accessor: keyof T | ((item: T) => string | number | null | undefined)
}

export interface CsvExportOptions {
  filename?: string
  delimiter?: string
  includeHeader?: boolean
}

/**
 * Escapa un valor para CSV
 * - Envuelve en comillas si contiene delimitador, comillas o saltos de línea
 * - Escapa comillas dobles duplicándolas
 */
function escapeCsvValue(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // Si contiene caracteres especiales, envolver en comillas
  if (
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Genera contenido CSV a partir de datos y definición de columnas
 */
export function generateCsv<T>(
  data: T[],
  columns: CsvColumn<T>[],
  options: CsvExportOptions = {}
): string {
  const { delimiter = ',', includeHeader = true } = options

  const rows: string[] = []

  // Header
  if (includeHeader) {
    const headerRow = columns
      .map((col) => escapeCsvValue(col.header, delimiter))
      .join(delimiter)
    rows.push(headerRow)
  }

  // Data rows
  for (const item of data) {
    const row = columns
      .map((col) => {
        const value =
          typeof col.accessor === 'function'
            ? col.accessor(item)
            : item[col.accessor]
        return escapeCsvValue(value, delimiter)
      })
      .join(delimiter)
    rows.push(row)
  }

  // BOM para UTF-8 (ayuda a Excel a reconocer encoding)
  const BOM = '\uFEFF'
  return BOM + rows.join('\r\n')
}

/**
 * Formatea fecha para CSV (ISO simplificado)
 */
export function formatDateForCsv(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Genera nombre de archivo con timestamp
 */
export function generateCsvFilename(prefix: string, eventName?: string): string {
  const timestamp = new Date().toISOString().slice(0, 10)
  const safeName = eventName
    ? `_${eventName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`
    : ''
  return `${prefix}${safeName}_${timestamp}.csv`
}
