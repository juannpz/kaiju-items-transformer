export type SchemaPrimitiveType = "string" | "number" | "boolean";

export type SchemaFieldType = SchemaPrimitiveType | "array";

export interface SchemaField {
    name: string;
    type: SchemaFieldType;
    required: boolean;
    description?: string;
    items?: {
        fields: SchemaField[];
    };
}

export interface TargetSchema {
    fields: SchemaField[];
    description?: string;
}

export type DocumentInput = Uint8Array | string;

export type DocumentFormat = "excel" | "csv" | "pdf" | "google_sheets";

export interface ProcessInput {
    document: DocumentInput;
    format?: DocumentFormat | "auto";
    filename?: string;
    sheets?: string[];
    /** Fila de encabezado (0-based). Si se omite, se detecta automáticamente. */
    headerRow?: number;
    /**
     * URL de una Google Sheet (link compartido o de edición). Requerida para
     * `format: "google_sheets"`; también se autodetecta desde `filename`.
     */
    sourceUrl?: string;
}

export interface LLMConfig {
    apiKey: string;
    model?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
}

export interface ProcessorConfig {
    schema: TargetSchema;
    llm: LLMConfig;
    locale?: string;
    /**
     * Extractor de texto/OCR opcional para PDF. Si se define, `PdfParser` lo usa
     * (p. ej. render + visión LLM, Tesseract, Textract, Cloud Vision) y devuelve
     * el texto plano del documento.
     */
    ocr?: (bytes: Uint8Array) => Promise<string>;
}

export interface MissingField {
    field: string;
    reason: string;
    affectedItems: number;
}

export type WarningType =
    | "type_coercion"
    | "low_confidence"
    | "missing_value"
    | "unknown_format";

export interface Warning {
    type: WarningType;
    field: string;
    itemIndex: number;
    message: string;
    originalValue?: string;
}

export interface ProcessMeta {
    sourceType: string;
    totalRowsFound: number;
    itemsExtracted: number;
    llmTokensUsed?: number;
    processingTimeMs: number;
}

export interface ProcessResult<T = Record<string, unknown>> {
    items: T[];
    missingFields: MissingField[];
    warnings: Warning[];
    meta: ProcessMeta;
}
