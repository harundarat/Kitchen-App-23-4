export function isValidObjectId(value: string | undefined): value is string {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}
