import type { Parser, ParserOptions, RawContent } from "./types.ts";

/**
 * Parser de PDF. Delega la extracción de texto/OCR al extractor provisto por el
 * caller (`ProcessorConfig.ocr`): render + visión LLM, Tesseract, AWS Textract,
 * Google Cloud Vision, etc. Sin extractor, no puede leer el contenido.
 */
export class PdfParser implements Parser {
    readonly format = "pdf";

    canParse(_data: Uint8Array, filename?: string): boolean {
        if (filename) {
            const ext = filename.split(".").pop()?.toLowerCase();
            return ext === "pdf";
        }
        return false;
    }

    async parse(data: Uint8Array, options?: ParserOptions): Promise<RawContent> {
        const header = new TextDecoder().decode(data.slice(0, 5));

        if (header !== "%PDF-") {
            throw new PdfParseError("File does not appear to be a valid PDF");
        }

        if (!options?.extractText) {
            throw new PdfParseError(
                "PDF parsing requires a text extractor/OCR. " +
                    "Provide `ocr` in ProcessorConfig (render + vision LLM, Tesseract, AWS Textract, " +
                    "Google Cloud Vision, etc.) returning the plain text of the document.",
            );
        }

        const text = await options.extractText(data);

        if (!text || text.trim() === "") {
            throw new PdfParseError("Text extractor returned empty content for the PDF");
        }

        return { type: "text", data: text };
    }
}

export class PdfParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PdfParseError";
    }
}
