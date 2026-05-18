export type CsvRow = Record<string, string>;

export type ImportErrorCode =
  | 'MISSING_REQUIRED'
  | 'DUPLICATE_EXTERNAL_ID'
  | 'INVALID_ENUM'
  | 'INVALID_BOOLEAN'
  | 'INVALID_DATE'
  | 'REFERENCE_NOT_FOUND'
  | 'DB_ERROR'
  | 'NOT_IMPLEMENTED_STAGE';

export type RowIssue = {
  stage: string;
  rowNumber: number;
  externalId?: string;
  field?: string;
  code: ImportErrorCode;
  message: string;
};

export type StageSummary = {
  stage: string;
  processed: number;
  imported: number;
  updated: number;
  rejected: number;
  skipped: number;
};

export type ImportContext = {
  dryRun: boolean;
  userIdByExternalId: Map<string, string>;
  userIdByEmail: Map<string, string>;
  partnerIdByExternalId: Map<string, string>;
  donationProjectIdByExternalId: Map<string, string>;
  volunteerProjectIdByExternalId: Map<string, string>;
  projectPositionIdByExternalId: Map<string, string>;
  sessionIdByExternalId: Map<string, string>;
};

export type ImportReport = {
  startedAt: string;
  finishedAt?: string;
  dryRun: boolean;
  sourceDir: string;
  summaries: StageSummary[];
  issues: RowIssue[];
};

export const makeStageSummary = (stage: string): StageSummary => ({
  stage,
  processed: 0,
  imported: 0,
  updated: 0,
  rejected: 0,
  skipped: 0,
});
