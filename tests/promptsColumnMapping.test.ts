import { buildColumnMappingSystemPrompt } from "../src/llm/promptsColumnMapping.ts";
import type { TargetSchema } from "../src/types.ts";

function assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg);
}

const schemaWithAttributes: TargetSchema = {
    fields: [
        { name: "name", type: "string", required: true },
        { name: "barcode", type: "string", required: false },
        {
            name: "barcodes",
            type: "array",
            required: false,
            items: {
                fields: [
                    { name: "barcode", type: "string", required: true },
                    { name: "barcode_type", type: "string", required: false },
                ],
            },
        },
        {
            name: "attributes",
            type: "array",
            required: false,
            items: {
                fields: [
                    { name: "attribute", type: "string", required: true },
                    { name: "value", type: "string", required: true },
                ],
            },
        },
    ],
};

const schemaBarcodesOnly: TargetSchema = {
    fields: [
        { name: "name", type: "string", required: true },
        {
            name: "barcodes",
            type: "array",
            required: false,
            items: {
                fields: [
                    { name: "barcode", type: "string", required: true },
                    { name: "barcode_type", type: "string", required: false },
                ],
            },
        },
    ],
};

Deno.test("prompt (es): guía genérica de campos array incluye attributes", () => {
    const prompt = buildColumnMappingSystemPrompt(schemaWithAttributes, "es");
    assert(prompt.includes("CAMPOS ARRAY"), "debe incluir la sección 7-ter");
    assert(
        prompt.includes('"array_field": "attributes"'),
        "debe incluir el ejemplo de array_field=attributes",
    );
    assert(
        prompt.includes('"value_field": "value"'),
        "debe indicar value_field=value para attributes",
    );
    assert(
        prompt.includes('"attribute": "material"'),
        "debe incluir el ejemplo meta.attribute=material",
    );
});

Deno.test("prompt (es): sin otros arrays, no agrega la sección 7-ter (barcodes usa 7-bis)", () => {
    const prompt = buildColumnMappingSystemPrompt(schemaBarcodesOnly, "es");
    assert(prompt.includes("barcodes"), "barcodes sigue presente en el prompt");
    assert(!prompt.includes("CAMPOS ARRAY"), "no debe agregar la sección genérica");
});

Deno.test("prompt (en): incluye la guía genérica de array fields", () => {
    const prompt = buildColumnMappingSystemPrompt(schemaWithAttributes, "en");
    assert(prompt.includes("ARRAY FIELDS"), "debe incluir la sección en inglés");
    assert(
        prompt.includes('"array_field": "attributes"'),
        "debe incluir el ejemplo de array_field=attributes",
    );
});
