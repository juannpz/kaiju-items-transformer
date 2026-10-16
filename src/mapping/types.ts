export type ColumnTarget =
    | { type: "field"; field: string }
    | { type: "field_suffix"; field: string }
    | { type: "price_channel"; channel_name: string; channel_id?: string }
    | {
        type: "array_entry";
        array_field: string;
        value_field: string;
        meta?: Record<string, unknown>;
    }
    | { type: "ignore" };

export interface ColumnMapping {
    columns: Record<string, ColumnTarget>;
    header_row: number;
}

export interface LLMColumnMappingResponse {
    column_mapping: Record<string, {
        target:
            | string
            | {
                channel_name: string;
                channel_id?: string;
            }
            | {
                array_field: string;
                value_field: string;
                meta?: Record<string, unknown>;
            }
            | null;
    }>;
    header_row: number;
    missing_fields: Array<{
        field: string;
        reason: string;
    }>;
    warnings: Array<{
        field: string;
        message: string;
    }>;
}

export interface ApplyMappingResult {
    items: Record<string, unknown>[];
    missingFields: Array<{ field: string; reason: string; affectedItems: number }>;
    warnings: Array<
        {
            type: "low_confidence" | "type_coercion" | "missing_value";
            field: string;
            itemIndex: number;
            message: string;
        }
    >;
}
