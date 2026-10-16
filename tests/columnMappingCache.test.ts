import { ColumnMappingCache } from "../src/training/ColumnMappingCache.ts";

function assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg);
}

Deno.test("ColumnMappingCache: la firma cambia el cache key (invalida mapeos viejos)", () => {
    const cache = ColumnMappingCache.init("/tmp/kaiju-cache-test");
    const headers = ["Nombre", "EAN", "Material"];

    const withoutSig = cache.getCacheKey(headers, headers);

    cache.setSignature("v1");
    const withV1 = cache.getCacheKey(headers, headers);

    cache.setSignature("v2");
    const withV2 = cache.getCacheKey(headers, headers);

    assert(withoutSig !== withV1, "la firma debe cambiar el key");
    assert(withV1 !== withV2, "distinta firma → distinto key");
    assert(withV1.startsWith("v1::"), "el key debe prefijar la firma");
});
