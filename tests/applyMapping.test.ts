import { applyColumnMapping } from "../src/mapping/applyMapping.ts";
import type { ColumnMapping } from "../src/mapping/types.ts";
import type { TabularData } from "../src/parsers/types.ts";
import type { TargetSchema } from "../src/types.ts";

function assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg);
}

const schema: TargetSchema = {
    fields: [
        { name: "name", type: "string", required: true },
        { name: "barcode", type: "string", required: false },
        { name: "current_stock", type: "number", required: false },
        { name: "prices", type: "array", required: false, items: { fields: [] } },
    ],
};

const mapping: ColumnMapping = {
    header_row: 0,
    columns: {
        Nombre: { type: "field", field: "name" },
        Codigo: { type: "field", field: "barcode" },
        Stock: { type: "field", field: "current_stock" },
        PVP: { type: "price_channel", channel_name: "PVP" },
    },
};

Deno.test("applyColumnMapping: mapea campos y precios por canal", () => {
    const data: TabularData = {
        headers: ["Nombre", "Codigo", "Stock", "PVP"],
        rows: [{ Nombre: "Arandela", Codigo: "1001", Stock: "15", PVP: "10,50" }],
        totalRows: 1,
    };
    const result = applyColumnMapping(data, mapping, schema);
    assert(result.items.length === 1, "1 item");
    const item = result.items[0];
    assert(item["name"] === "Arandela", "name");
    assert(item["barcode"] === "1001", "barcode");
    assert(item["current_stock"] === 15, "stock coerced");
    const prices = item["prices"] as Array<Record<string, unknown>>;
    assert(Array.isArray(prices) && prices.length === 1, "prices");
    assert(prices[0]["price"] === 10.5, "price");
    assert(prices[0]["channel_id"] === "pvp", "channel slug");
});

Deno.test("applyColumnMapping: salta filas de banner", () => {
    const data: TabularData = {
        headers: ["Nombre", "Codigo", "Stock", "PVP"],
        rows: [
            { Nombre: "Rubro: Ferretería", Codigo: null, Stock: null, PVP: null },
            { Nombre: "Arandela", Codigo: "1001", Stock: "1", PVP: "5" },
        ],
        totalRows: 2,
    };
    const result = applyColumnMapping(data, mapping, schema);
    assert(result.items.length === 1, "banner skipeado");
    assert(result.items[0]["name"] === "Arandela", "restante");
});
