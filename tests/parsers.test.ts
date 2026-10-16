import * as XLSX from "xlsx";
import { CsvParser, ExcelParser } from "../src/parsers/ExcelParser.ts";
import type { RawContent, TabularData } from "../src/parsers/types.ts";

function assertEq(actual: unknown, expected: unknown, msg: string) {
    if (actual !== expected) {
        throw new Error(
            `${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        );
    }
}

function xlsxBytes(aoa: unknown[][]): Uint8Array {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
    return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer);
}

function asTabular(content: RawContent): TabularData {
    if (
        content.type !== "tabular" || Array.isArray(content.data) ||
        typeof content.data === "string"
    ) {
        throw new Error("expected single tabular");
    }
    return content.data;
}

Deno.test("ExcelParser: detecta header tras preámbulo", () => {
    const bytes = xlsxBytes([
        ["Listado de productos", "", ""],
        ["", "", ""],
        ["COD", "Producto", "Precio"],
        ["1001", "Arandela", 10],
        ["1002", "Tornillo", 20],
    ]);
    const data = asTabular(new ExcelParser().parse(bytes));
    assertEq(data.headers.join(","), "COD,Producto,Precio", "headers");
    assertEq(data.rows.length, 2, "rows");
    assertEq(data.rows[0]["Producto"], "Arandela", "row0");
});

Deno.test("ExcelParser: respeta options.headerRow", () => {
    const bytes = xlsxBytes([
        ["COD", "Producto"],
        ["1001", "Arandela"],
    ]);
    const data = asTabular(new ExcelParser().parse(bytes, { headerRow: 0 }));
    assertEq(data.headers[0], "COD", "header override");
    assertEq(data.rows.length, 1, "rows");
});

Deno.test("CsvParser: detecta header tras preámbulo y columnas vacías (export Google Sheets)", () => {
    const csv = [
        "LISTA DE PRECIOS - DISTRIBUIDORA DEL CENTRO S.A.,,,,,",
        "Vigencia 2026-10-01 | PVP con IVA incluido,,,,,",
        ",,,,,",
        "CODIGO,EAN,DESCRIPCION,STOCK,PRECIO PVP,",
        "BUL-HEX-516,7791234500017,BULON HEX 5/16,500,350.00,",
        "ARAND-PLA-M8,7791234500031,ARANDELA M8,2000,95.00,",
    ].join("\n");
    const data = asTabular(new CsvParser().parse(new TextEncoder().encode(csv)));
    assertEq(data.headers.join(","), "CODIGO,EAN,DESCRIPCION,STOCK,PRECIO PVP", "headers");
    assertEq(data.rows.length, 2, "rows");
    assertEq(data.rows[0]["DESCRIPCION"], "BULON HEX 5/16", "row0");
    assertEq(data.rows[1]["STOCK"], "2000", "row1 stock");
});

Deno.test("CsvParser: delimitador y comillas", () => {
    const csv = 'COD;Producto;Precio\n1001;"Arandela 1/4; negra";10,5\n1002;Tornillo;20\n';
    const content = new CsvParser().parse(new TextEncoder().encode(csv));
    const data = asTabular(content);
    assertEq(data.headers.join(","), "COD,Producto,Precio", "headers");
    assertEq(data.rows.length, 2, "rows");
    assertEq(data.rows[0]["Producto"], "Arandela 1/4; negra", "quoted value");
});
