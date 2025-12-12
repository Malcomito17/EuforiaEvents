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
type ModuleName = 'musicadj' | 'karaokeya';
type LanguageCode = 'es' | 'en' | 'formal';
interface MessagesConfig {
    [key: string]: string | MessagesConfig;
}
interface ModuleMessages {
    common?: MessagesConfig;
    [key: string]: any;
}
/**
 * Obtiene los mensajes por defecto de un módulo
 */
export declare function getDefaultMessages(module: ModuleName, language?: LanguageCode): ModuleMessages;
/**
 * Obtiene un mensaje específico por path (ej: "search.placeholder")
 */
export declare function getMessage(module: ModuleName, path: string, language?: LanguageCode, customMessages?: string | null): string;
/**
 * Reemplaza placeholders en un mensaje
 * Ejemplo: replacePlaceholders("Espera {seconds} segundos", { seconds: 30 })
 *          -> "Espera 30 segundos"
 */
export declare function replacePlaceholders(message: string, values: Record<string, string | number>): string;
/**
 * Obtiene un mensaje completo con placeholders reemplazados
 */
export declare function getMessageWithValues(module: ModuleName, path: string, values: Record<string, string | number>, language?: LanguageCode, customMessages?: string | null): string;
export type { ModuleName, LanguageCode, MessagesConfig, ModuleMessages };
//# sourceMappingURL=messages.service.d.ts.map