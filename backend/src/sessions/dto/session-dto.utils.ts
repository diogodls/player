export function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function toOptionalNumber(value: unknown): unknown {
  return value === undefined || value === '' ? undefined : Number(value);
}
