export const isEmpty = (value: string | undefined | null): boolean => {
  return value === undefined || value === null || value.trim() === '';
};

export const toOptional = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export const toBoolean = (value: string | undefined): boolean | undefined => {
  if (!value || value.trim() === '') {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  return undefined;
};

export const toDate = (value: string | undefined): Date | undefined => {
  if (!value || value.trim() === '') {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
};

export const splitPipe = (value: string | undefined): string[] => {
  if (!value || value.trim() === '') {
    return [];
  }
  return value
    .split('|')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};
