import type { Parser, ParserOptions, RawContent } from "./types.ts";
import { CsvParser, ParseError } from "./ExcelParser.ts";

/**
 * Normaliza una URL/ID de Google Sheets a la URL de exportación CSV.
 * Acepta: URL de edición/compartida (`.../spreadsheets/d/<id>/...`), URL con
 * `gid`, o directamente el ID. Devuelve `null` si no es una Sheet de Google.
 */
export function googleSheetCsvUrl(input: string): string | null {
    const value = (input ?? "").trim();
    if (!value) return null;

    const idMatch = value.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const id = idMatch ? idMatch[1] : /^[a-zA-Z0-9-_]{20,}$/.test(value) ? value : null;

    if (!id) return null;

    const gidMatch = value.match(/[#?&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : null;

    const base = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
    return gid ? `${base}&gid=${gid}` : base;
}

/**
 * Parser de Google Sheets: descarga la hoja como CSV (link público o
 * "cualquiera con el enlace") y reutiliza el parser CSV.
 */
export class GoogleSheetsParser implements Parser {
    readonly format = "google_sheets";

    canParse(_data: Uint8Array, filename?: string): boolean {
        return !!filename && googleSheetCsvUrl(filename) !== null;
    }

    async parse(_data: Uint8Array, options?: ParserOptions): Promise<RawContent> {
        const url = options?.url ? googleSheetCsvUrl(options.url) : null;

        if (!url) {
            throw new ParseError(
                "Google Sheets: falta la URL de la hoja (`sourceUrl` o `filename`).",
            );
        }

        const response = await fetch(url, { redirect: "follow" });
        if (!response.ok) {
            throw new ParseError(
                `Google Sheets: no se pudo descargar la hoja (status ${response.status}). ` +
                    "Verificá que la hoja esté compartida como 'cualquiera con el enlace'.",
            );
        }

        const text = await response.text();

        // Una hoja privada devuelve HTML de login en lugar de CSV.
        if (/^\s*<(?:!doctype|html)/i.test(text)) {
            throw new ParseError(
                "Google Sheets: la hoja no es pública (devolvió HTML). " +
                    "Compartila como 'cualquiera con el enlace'.",
            );
        }

        return new CsvParser().parse(new TextEncoder().encode(text));
    }
}
