import fs from 'fs/promises';
import path from 'path';
import { ImportReport, RowIssue, StageSummary, makeStageSummary } from './types';

export const getOrCreateStage = (
  summaries: StageSummary[],
  stage: string
): StageSummary => {
  let summary = summaries.find((item) => item.stage === stage);
  if (!summary) {
    summary = makeStageSummary(stage);
    summaries.push(summary);
  }
  return summary;
};

export const pushIssue = (
  report: ImportReport,
  issue: RowIssue
): void => {
  report.issues.push(issue);
  const stage = getOrCreateStage(report.summaries, issue.stage);
  stage.rejected += 1;
};

export const writeReport = async (
  reportDir: string,
  report: ImportReport
): Promise<string> => {
  await fs.mkdir(reportDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(reportDir, `import-report-${timestamp}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
  return filePath;
};
