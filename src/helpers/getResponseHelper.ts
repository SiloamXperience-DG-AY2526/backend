/**
 * Helper to get the value of a submission response by field alias.
 * Returns empty string if not found or value is null.
 */
export const getResponseValue = (
  submission:
    | { responses: { field: { fieldAlias: string }; value: string | null }[] }
    | null
    | undefined,
  alias: string
): string => {
  return submission?.responses.find(
    (r: { field: { fieldAlias: string }; value: string | null }) =>
      r.field.fieldAlias === alias
  )?.value ?? '';

};
