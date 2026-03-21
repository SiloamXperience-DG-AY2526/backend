import fs from 'fs/promises';
import { CsvRow } from './types';

type CsvData = {
  headers: string[];
  rows: CsvRow[];
};

const normalizeHeader = (header: string): string =>
  header.replace(/\s*\([^)]*\)\s*$/, '').trim();

const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      out.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  out.push(current.trim());
  return out;
};

export const readCsv = async (filePath: string): Promise<CsvData> => {
  const raw = await fs.readFile(filePath, 'utf-8');
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => normalizeHeader(h));
  const rows: CsvRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = parseCsvLine(lines[lineIndex]);
    const row: CsvRow = {};

    for (let colIndex = 0; colIndex < headers.length; colIndex += 1) {
      row[headers[colIndex]] = (values[colIndex] ?? '').trim();
    }

    rows.push(row);
  }

  return { headers, rows };
};

export const hasColumns = (headers: string[], requiredColumns: string[]) => {
  const set = new Set(headers);
  return requiredColumns.filter((column) => !set.has(column));
};
