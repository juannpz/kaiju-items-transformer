/**
 * Convierte a número tolerando formatos es-AR (`1.234,56`) y en-US (`1,234.56`),
 * símbolos de moneda y espacios. Heurística de separadores:
 * - con ambos separadores, el más a la derecha es el decimal;
 * - con un solo separador, si agrupa de a 3 (`2,000` / `1.234`) es miles; si no, decimal.
 */
export function coerceToNumber(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    if (typeof value !== "string") return null;

    let s = value
        .replace(/^[$€£¥]\s*/, "")
        .replace(/\s*[$€£¥]$/, "")
        .replace(/\s/g, "")
        .trim();
    if (s === "") return null;

    let sign = "";
    if (s[0] === "+" || s[0] === "-") {
        sign = s[0];
        s = s.slice(1);
    }

    const lastDot = s.lastIndexOf(".");
    const lastComma = s.lastIndexOf(",");

    if (lastDot >= 0 && lastComma >= 0) {
        if (lastComma > lastDot) {
            // Decimal con coma (es-AR): los puntos son miles.
            s = s.replace(/\./g, "").replace(",", ".");
        } else {
            // Decimal con punto (en-US): las comas son miles.
            s = s.replace(/,/g, "");
        }
    } else if (lastComma >= 0) {
        s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
    } else if (lastDot >= 0) {
        if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
        // si no agrupa de a 3, el punto ya es decimal.
    }

    const parsed = Number(sign + s);
    return isNaN(parsed) ? null : parsed;
}

export function coerceToString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value.trim();
    return String(value).trim();
}

export function coerceToBoolean(value: unknown): boolean | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
        const lower = value.toLowerCase().trim();
        if (["true", "1", "si", "sí", "yes", "activo", "active", "verdadero"].includes(lower)) {
            return true;
        }
        if (["false", "0", "no", "inactivo", "inactive", "falso"].includes(lower)) return false;
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    return null;
}

export function coerceValue(
    value: unknown,
    targetType: "string" | "number" | "boolean",
): { value: unknown; coerced: boolean } {
    if (targetType === "number") {
        const result = coerceToNumber(value);
        if (result !== null) return { value: result, coerced: typeof value !== "number" };
        return { value: null, coerced: false };
    }

    if (targetType === "boolean") {
        const result = coerceToBoolean(value);
        if (result !== null) return { value: result, coerced: typeof value !== "boolean" };
        return { value: null, coerced: false };
    }

    const result = coerceToString(value);
    return { value: result, coerced: typeof value !== "string" };
}
