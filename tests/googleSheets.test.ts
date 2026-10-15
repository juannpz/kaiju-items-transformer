import { googleSheetCsvUrl } from "../src/parsers/googleSheets.ts";

function assertEq(actual: unknown, expected: unknown, msg: string) {
    if (actual !== expected) {
        throw new Error(
            `${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        );
    }
}

Deno.test("googleSheetCsvUrl: URL de edición con gid", () => {
    assertEq(
        googleSheetCsvUrl("https://docs.google.com/spreadsheets/d/ABC123xyz_-/edit#gid=12345"),
        "https://docs.google.com/spreadsheets/d/ABC123xyz_-/export?format=csv&gid=12345",
        "edit con gid",
    );
});

Deno.test("googleSheetCsvUrl: URL de edición sin gid", () => {
    assertEq(
        googleSheetCsvUrl("https://docs.google.com/spreadsheets/d/ABC123xyz_-/edit?usp=sharing"),
        "https://docs.google.com/spreadsheets/d/ABC123xyz_-/export?format=csv",
        "edit sin gid",
    );
});

Deno.test("googleSheetCsvUrl: gid como query", () => {
    assertEq(
        googleSheetCsvUrl("https://docs.google.com/spreadsheets/d/IDD/edit?gid=777"),
        "https://docs.google.com/spreadsheets/d/IDD/export?format=csv&gid=777",
        "gid query",
    );
});

Deno.test("googleSheetCsvUrl: ID pelado", () => {
    assertEq(
        googleSheetCsvUrl("1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"),
        "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789/export?format=csv",
        "id pelado",
    );
});

Deno.test("googleSheetCsvUrl: no es una sheet", () => {
    assertEq(googleSheetCsvUrl("mi-archivo.xlsx"), null, "archivo");
    assertEq(googleSheetCsvUrl(""), null, "vacío");
    assertEq(googleSheetCsvUrl("https://example.com/foo"), null, "otra url");
});
