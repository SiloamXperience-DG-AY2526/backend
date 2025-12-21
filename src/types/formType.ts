//if import from @prisma/client CI/CD fails hence created type files
export enum FieldType {
  TEXT = 'TEXT',
  SINGLE = 'SINGLE',
  MULTI = 'MULTI',
}
export interface ResponseData {
  fieldId: string;
  value: string;
}