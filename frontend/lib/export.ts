"use client";

export type TableExportFormat = "CSV" | "Excel" | "PDF";

export type TableExportColumn<T> = {
  label: string;
  value: (row: T) => unknown;
};

type ExportTableOptions<T> = {
  title: string;
  filename: string;
  format: TableExportFormat;
  columns: TableExportColumn<T>[];
  rows: T[];
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const toCellString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item): string => toCellString(item)).join(", ");
  }

  return String(value);
};

const buildMatrix = <T,>(columns: TableExportColumn<T>[], rows: T[]) => ({
  headers: columns.map((column) => column.label),
  values: rows.map((row) => columns.map((column) => toCellString(column.value(row)))),
});

const downloadBlob = (filename: string, type: string, content: string) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
};

const buildTableHtml = (title: string, headers: string[], rows: string[][]) => {
  const headerHtml = headers
    .map(
      (header) =>
        `<th style="padding:12px 14px;border:1px solid #d9dde5;background:#f7f9fc;text-align:left;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#526071;">${escapeHtml(header)}</th>`,
    )
    .join("");

  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="padding:12px 14px;border:1px solid #d9dde5;font-size:14px;color:#182230;vertical-align:top;">${escapeHtml(cell)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="font-family:Inter,Arial,sans-serif;background:#ffffff;color:#182230;padding:32px;">
    <h1 style="margin:0 0 20px;font-size:28px;">${escapeHtml(title)}</h1>
    <p style="margin:0 0 24px;color:#526071;">Generated ${escapeHtml(new Date().toLocaleString())}</p>
    <table style="width:100%;border-collapse:collapse;border-spacing:0;">
      <thead>
        <tr>${headerHtml}</tr>
      </thead>
      <tbody>
        ${bodyHtml}
      </tbody>
    </table>
  </body>
</html>`;
};

const exportCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");

  downloadBlob(`${filename}.csv`, "text/csv;charset=utf-8;", csv);
};

const exportExcel = (filename: string, title: string, headers: string[], rows: string[][]) => {
  const html = buildTableHtml(title, headers, rows);
  downloadBlob(
    `${filename}.xls`,
    "application/vnd.ms-excel;charset=utf-8;",
    html,
  );
};

const exportPdf = (filename: string, title: string, headers: string[], rows: string[][]) => {
  const html = buildTableHtml(title, headers, rows);
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");

  if (!popup) {
    downloadBlob(`${filename}.html`, "text/html;charset=utf-8;", html);
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
};

export const exportTableData = <T,>({
  title,
  filename,
  format,
  columns,
  rows,
}: ExportTableOptions<T>) => {
  const { headers, values } = buildMatrix(columns, rows);

  if (format === "CSV") {
    exportCsv(filename, headers, values);
    return;
  }

  if (format === "Excel") {
    exportExcel(filename, title, headers, values);
    return;
  }

  exportPdf(filename, title, headers, values);
};
