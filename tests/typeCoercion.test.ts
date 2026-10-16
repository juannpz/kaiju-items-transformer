import { coerceToNumber } from "../src/utils/typeCoercion.ts";

function assertEq(actual: unknown, expected: unknown, msg: string) {
    if (actual !== expected) {
        throw new Error(
            `${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        );
    }
}

Deno.test("coerceToNumber: en-US (punto decimal, coma miles)", () => {
    assertEq(coerceToNumber("350.00"), 350, "350.00");
    assertEq(coerceToNumber("2,000"), 2000, "2,000");
    assertEq(coerceToNumber("48,500.00"), 48500, "48,500.00");
    assertEq(coerceToNumber("1,234.56"), 1234.56, "1,234.56");
});

Deno.test("coerceToNumber: es-AR (coma decimal, punto miles)", () => {
    assertEq(coerceToNumber("1.234,56"), 1234.56, "1.234,56");
    assertEq(coerceToNumber("10,5"), 10.5, "10,5");
    assertEq(coerceToNumber("1.234"), 1234, "1.234 miles");
    assertEq(coerceToNumber("1,234,567"), 1234567, "1,234,567");
});

Deno.test("coerceToNumber: símbolos, signos y no-números", () => {
    assertEq(coerceToNumber("$ 1.500,50"), 1500.5, "$ 1.500,50");
    assertEq(coerceToNumber("95"), 95, "95");
    assertEq(coerceToNumber("-1.234,5"), -1234.5, "negativo AR");
    assertEq(coerceToNumber("5/16"), null, "fracción no es número");
    assertEq(coerceToNumber("115mm"), null, "con sufijo no es número");
});
