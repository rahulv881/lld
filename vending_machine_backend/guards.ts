export function isWhole(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value);
}
