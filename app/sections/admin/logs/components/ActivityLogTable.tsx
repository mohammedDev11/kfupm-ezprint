// "use client";

// import React, { useMemo, useState } from "react";
// import {
//   AlertTriangle,
//   FileText,
//   Laptop,
//   Printer,
//   Shield,
//   Wrench,
// } from "lucide-react";
// import Modal from "@/app/components/ui/modal/Modal";
// import StatusBadge from "@/app/components/ui/badge/StatusBadge";
// import {
//   Dropdown,
//   DropdownContent,
//   DropdownItem,
//   DropdownTrigger,
// } from "@/app/components/ui/dropdown/Dropdown";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableControls,
//   TableEmptyState,
//   TableGrid,
//   TableHeader,
//   TableHeaderCell,
//   TableMain,
//   TableSearch,
//   TableTitleBlock,
//   TableTop,
// } from "@/app/components/shared/table/Table";
// import {
//   ActivityLogItem,
//   ActivityLogSortKey,
//   ActivityLogStatus,
//   ActivityLogType,
//   ActivityLogStatusFilter,
//   ActivityLogTypeFilter,
//   activityLogColumns,
//   activityLogsData,
//   activityLogStatusOptions,
//   activityLogTypeOptions,
// } from "@/Data/Admin/logs";

// type SortDir = "asc" | "desc";

// const columnsClassName =
//   "[grid-template-columns:minmax(180px,1fr)_minmax(180px,0.9fr)_minmax(260px,1.5fr)_minmax(160px,0.9fr)_minmax(210px,1fr)_minmax(100px,0.6fr)_minmax(150px,0.8fr)]";

// function LogTypeBadge({ type }: { type: ActivityLogType }) {
//   const config: Record<
//     ActivityLogType,
//     {
//       label: string;
//       icon: React.ReactNode;
//       className: string;
//     }
//   > = {
//     "Print Job": {
//       label: "Print Job",
//       icon: <Printer className="h-4 w-4" />,
//       className: "bg-brand-50 text-brand-500",
//     },
//     System: {
//       label: "System",
//       icon: <Laptop className="h-4 w-4" />,
//       className: "bg-violet-50 text-violet-500",
//     },
//     Device: {
//       label: "Device",
//       icon: <Wrench className="h-4 w-4" />,
//       className: "bg-sky-50 text-sky-600",
//     },
//     Security: {
//       label: "Security",
//       icon: <Shield className="h-4 w-4" />,
//       className: "bg-amber-50 text-amber-600",
//     },
//   };

//   const item = config[type];

//   return (
//     <span
//       className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${item.className}`}
//     >
//       {item.icon}
//       <span>{item.label}</span>
//     </span>
//   );
// }

// function LogStatusBadge({ status }: { status: ActivityLogStatus }) {
//   if (status === "Success") {
//     return <StatusBadge label="Success" tone="success" />;
//   }

//   if (status === "Failed") {
//     return <StatusBadge label="Failed" tone="danger" />;
//   }

//   if (status === "Warning") {
//     return <StatusBadge label="Warning" tone="warning" />;
//   }

//   return <StatusBadge label="Info" tone="inactive" />;
// }

// function DetailRow({
//   label,
//   value,
// }: {
//   label: string;
//   value?: React.ReactNode;
// }) {
//   if (!value && value !== 0) return null;

//   return (
//     <div
//       className="flex items-start justify-between gap-4 rounded-xl px-4 py-3"
//       style={{ background: "var(--surface-2)" }}
//     >
//       <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
//       <span className="text-right text-sm font-semibold text-[var(--foreground)]">
//         {value}
//       </span>
//     </div>
//   );
// }

// const ActivityLogTable = () => {
//   const [search, setSearch] = useState("");
//   const [sortKey, setSortKey] = useState<ActivityLogSortKey>("time");
//   const [sortDir, setSortDir] = useState<SortDir>("asc");
//   const [typeFilter, setTypeFilter] = useState<ActivityLogTypeFilter>("all");
//   const [statusFilter, setStatusFilter] =
//     useState<ActivityLogStatusFilter>("all");
//   const [openLogModal, setOpenLogModal] = useState<ActivityLogItem | null>(
//     null
//   );

//   const handleSort = (key: ActivityLogSortKey) => {
//     if (sortKey === key) {
//       setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
//       return;
//     }

//     setSortKey(key);
//     setSortDir("asc");
//   };

//   const filteredLogs = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return [...activityLogsData]
//       .filter((log) => {
//         const matchesSearch =
//           !term ||
//           log.time.toLowerCase().includes(term) ||
//           log.type.toLowerCase().includes(term) ||
//           log.title.toLowerCase().includes(term) ||
//           log.description.toLowerCase().includes(term) ||
//           log.user.toLowerCase().includes(term) ||
//           log.printer.toLowerCase().includes(term) ||
//           log.status.toLowerCase().includes(term) ||
//           (log.documentName ?? "").toLowerCase().includes(term) ||
//           (log.location ?? "").toLowerCase().includes(term);

//         const matchesType =
//           typeFilter === "all" ? true : log.type === typeFilter;

//         const matchesStatus =
//           statusFilter === "all" ? true : log.status === statusFilter;

//         return matchesSearch && matchesType && matchesStatus;
//       })
//       .sort((a, b) => {
//         const getValue = (item: ActivityLogItem) => {
//           switch (sortKey) {
//             case "time":
//               return item.time.toLowerCase();
//             case "type":
//               return item.type.toLowerCase();
//             case "title":
//               return item.title.toLowerCase();
//             case "user":
//               return item.user.toLowerCase();
//             case "printer":
//               return item.printer.toLowerCase();
//             case "pages":
//               return item.pages ?? -1;
//             case "status":
//               return item.status.toLowerCase();
//             default:
//               return item.time.toLowerCase();
//           }
//         };

//         const aValue = getValue(a);
//         const bValue = getValue(b);

//         if (typeof aValue === "number" && typeof bValue === "number") {
//           return sortDir === "asc" ? aValue - bValue : bValue - aValue;
//         }

//         return sortDir === "asc"
//           ? String(aValue).localeCompare(String(bValue))
//           : String(bValue).localeCompare(String(aValue));
//       });
//   }, [search, sortKey, sortDir, typeFilter, statusFilter]);

//   return (
//     <>
//       <Table>
//         <TableTop>
//           <TableTitleBlock
//             title="Activity Log"
//             description={`${filteredLogs.length} entries`}
//           />

//           <TableControls>
//             <TableSearch
//               id="search-activity-logs"
//               label="Search logs..."
//               value={search}
//               onChange={setSearch}
//               wrapperClassName="w-full md:w-[330px]"
//             />

//             <Dropdown
//               value={typeFilter}
//               onValueChange={(value) =>
//                 setTypeFilter(value as ActivityLogTypeFilter)
//               }
//             >
//               <DropdownTrigger className="h-14 min-w-[170px] rounded-2xl px-5 text-base">
//                 {activityLogTypeOptions.find(
//                   (item) => item.value === typeFilter
//                 )?.label ?? "All Types"}
//               </DropdownTrigger>

//               <DropdownContent align="right" widthClassName="w-[220px]">
//                 {activityLogTypeOptions.map((item) => (
//                   <DropdownItem key={item.value} value={item.value}>
//                     {item.label}
//                   </DropdownItem>
//                 ))}
//               </DropdownContent>
//             </Dropdown>

//             <Dropdown
//               value={statusFilter}
//               onValueChange={(value) =>
//                 setStatusFilter(value as ActivityLogStatusFilter)
//               }
//             >
//               <DropdownTrigger className="h-14 min-w-[180px] rounded-2xl px-5 text-base">
//                 {activityLogStatusOptions.find(
//                   (item) => item.value === statusFilter
//                 )?.label ?? "All Statuses"}
//               </DropdownTrigger>

//               <DropdownContent align="right" widthClassName="w-[220px]">
//                 {activityLogStatusOptions.map((item) => (
//                   <DropdownItem key={item.value} value={item.value}>
//                     {item.label}
//                   </DropdownItem>
//                 ))}
//               </DropdownContent>
//             </Dropdown>
//           </TableControls>
//         </TableTop>

//         <TableMain>
//           <TableGrid minWidthClassName="min-w-[1500px]">
//             <TableHeader columnsClassName={columnsClassName}>
//               {activityLogColumns.map((column) => (
//                 <TableHeaderCell
//                   key={column.key}
//                   label={column.label}
//                   sortable={column.sortable}
//                   active={sortKey === column.key}
//                   direction={sortDir}
//                   onClick={() => handleSort(column.key)}
//                 />
//               ))}
//             </TableHeader>

//             <TableBody>
//               {filteredLogs.length === 0 ? (
//                 <TableEmptyState text="No activity logs found" />
//               ) : (
//                 filteredLogs.map((log) => {
//                   return (
//                     <div
//                       key={log.id}
//                       onClick={() => setOpenLogModal(log)}
//                       className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
//                     >
//                       <TableCell className="paragraph font-medium text-[var(--muted)]">
//                         {log.time}
//                       </TableCell>

//                       <TableCell>
//                         <LogTypeBadge type={log.type} />
//                       </TableCell>

//                       <TableCell className="min-w-0">
//                         <div className="min-w-0">
//                           <p className="paragraph font-semibold text-[var(--foreground)]">
//                             {log.title}
//                           </p>
//                           <p className="paragraph mt-1 text-[var(--muted)]">
//                             {log.description}
//                           </p>
//                         </div>
//                       </TableCell>

//                       <TableCell className="paragraph">{log.user}</TableCell>

//                       <TableCell className="paragraph">{log.printer}</TableCell>

//                       <TableCell className="paragraph font-semibold">
//                         {log.pages ?? "—"}
//                       </TableCell>

//                       <TableCell>
//                         <LogStatusBadge status={log.status} />
//                       </TableCell>
//                     </div>
//                   );
//                 })
//               )}
//             </TableBody>
//           </TableGrid>
//         </TableMain>
//       </Table>

//       <Modal open={Boolean(openLogModal)} onClose={() => setOpenLogModal(null)}>
//         <div className="min-w-[320px] space-y-6 md:min-w-[760px]">
//           <div className="space-y-2">
//             <div className="flex flex-wrap items-center gap-3">
//               {openLogModal ? <LogTypeBadge type={openLogModal.type} /> : null}
//               {openLogModal ? (
//                 <LogStatusBadge status={openLogModal.status} />
//               ) : null}
//             </div>

//             <h3 className="title-md">{openLogModal?.title}</h3>
//             <p className="paragraph">{openLogModal?.description}</p>
//           </div>

//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//             <DetailRow label="Time" value={openLogModal?.time} />
//             <DetailRow label="User" value={openLogModal?.user} />
//             <DetailRow label="Printer" value={openLogModal?.printer} />
//             <DetailRow label="Pages" value={openLogModal?.pages ?? "—"} />
//             <DetailRow
//               label="Document Name"
//               value={openLogModal?.documentName}
//             />
//             <DetailRow label="Device IP" value={openLogModal?.deviceIp} />
//             <DetailRow label="Queue Name" value={openLogModal?.queueName} />
//             <DetailRow
//               label="Serial Number"
//               value={openLogModal?.serialNumber}
//             />
//             <DetailRow label="Location" value={openLogModal?.location} />
//           </div>

//           {openLogModal?.resolutionNote ? (
//             <div
//               className="rounded-2xl px-4 py-4"
//               style={{ background: "var(--surface-2)" }}
//             >
//               <div className="mb-2 flex items-center gap-2">
//                 <AlertTriangle className="h-4 w-4 text-brand-500" />
//                 <p className="text-sm font-semibold text-[var(--foreground)]">
//                   Resolution / Note
//                 </p>
//               </div>

//               <p className="text-sm text-[var(--paragraph)]">
//                 {openLogModal.resolutionNote}
//               </p>
//             </div>
//           ) : null}
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default ActivityLogTable;

// ==========NEW=============
// ActivityLogTable.tsx

"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  FileOutput,
  Laptop,
  Printer,
  Shield,
  Wrench,
} from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import Modal from "@/app/components/ui/modal/Modal";
import ExpandedButton from "@/app/components/ui/button/ExpandedButton";
import Button from "@/app/components/ui/button/Button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/app/components/ui/dropdown/Dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableControls,
  TableEmptyState,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableMain,
  TableSearch,
  TableTitleBlock,
  TableTop,
} from "@/app/components/shared/table/Table";
import {
  ActivityLogItem,
  ActivityLogSortKey,
  ActivityLogStatus,
  ActivityLogType,
  ActivityLogStatusFilter,
  ActivityLogTypeFilter,
  activityLogColumns,
  activityLogsData,
  activityLogStatusOptions,
  activityLogTypeOptions,
  activityLogStatusSortOrder,
} from "@/Data/Admin/logs";

type SortDir = "asc" | "desc";
type ExportMethod = "PDF" | "CSV" | "Excel";
type ActionValue = "export-selected";

const columnsClassName =
  "[grid-template-columns:72px_minmax(180px,1fr)_minmax(180px,0.9fr)_minmax(260px,1.5fr)_minmax(160px,0.9fr)_minmax(210px,1fr)_minmax(100px,0.6fr)_minmax(150px,0.8fr)]";

function LogTypeBadge({ type }: { type: ActivityLogType }) {
  const config: Record<
    ActivityLogType,
    {
      label: string;
      icon: React.ReactNode;
      className: string;
    }
  > = {
    "Print Job": {
      label: "Print Job",
      icon: <Printer className="h-4 w-4" />,
      className: "bg-brand-50 text-brand-500",
    },
    System: {
      label: "System",
      icon: <Laptop className="h-4 w-4" />,
      className: "bg-violet-50 text-violet-500",
    },
    Device: {
      label: "Device",
      icon: <Wrench className="h-4 w-4" />,
      className: "bg-sky-50 text-sky-600",
    },
    Security: {
      label: "Security",
      icon: <Shield className="h-4 w-4" />,
      className: "bg-amber-50 text-amber-600",
    },
  };

  const item = config[type];

  return (
    <span
      className={`inline-flex h-12 min-w-[124px] items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold ${item.className}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
}

function LogStatusBadge({ status }: { status: ActivityLogStatus }) {
  const config: Record<
    ActivityLogStatus,
    {
      label: string;
      className: string;
    }
  > = {
    Success: {
      label: "Success",
      className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    Failed: {
      label: "Failed",
      className: "bg-red-50 text-red-500 border border-red-100",
    },
    Warning: {
      label: "Warning",
      className: "bg-amber-50 text-amber-600 border border-amber-100",
    },
    Info: {
      label: "Info",
      className: "bg-slate-100 text-slate-600 border border-slate-200",
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex h-12 min-w-[124px] items-center justify-center rounded-md px-4 text-sm font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function DetailRow({
  label,
  value,
  hidden = false,
  revealed = false,
  onToggleReveal,
}: {
  label: string;
  value?: React.ReactNode;
  hidden?: boolean;
  revealed?: boolean;
  onToggleReveal?: () => void;
}) {
  if (!value && value !== 0) return null;

  return (
    <div
      className="flex items-start justify-between gap-4 rounded-xl px-4 py-3"
      style={{ background: "var(--surface-2)" }}
    >
      <span className="text-sm font-medium text-[var(--muted)]">{label}</span>

      <div className="flex items-center gap-2">
        <span className="text-right text-sm font-semibold text-[var(--foreground)]">
          {hidden && !revealed ? "••••••••••" : value}
        </span>

        {hidden ? (
          <button
            type="button"
            onClick={onToggleReveal}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-black/5"
            aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4 text-[var(--muted)]" />
            ) : (
              <Eye className="h-4 w-4 text-[var(--muted)]" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function LogItemCard({
  log,
  subtitle,
  onRemove,
}: {
  log: ActivityLogItem;
  subtitle: string;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl border p-4"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
      }}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--title)]">
          {log.title}
        </p>
        <p className="truncate text-sm text-[var(--muted)]">{subtitle}</p>
      </div>

      <ExpandedButton
        id={`remove-${log.id}`}
        label="Remove"
        icon={RiDeleteBin6Line}
        variant="danger"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    </div>
  );
}

const ActivityLogTable = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<ActivityLogSortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [typeFilter, setTypeFilter] = useState<ActivityLogTypeFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<ActivityLogStatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openLogModal, setOpenLogModal] = useState<ActivityLogItem | null>(
    null
  );
  const [showDeviceIp, setShowDeviceIp] = useState(false);
  const [showSerialNumber, setShowSerialNumber] = useState(false);
  const [actionModal, setActionModal] = useState<ActionValue | null>(null);
  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");

  const handleSort = (key: ActivityLogSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...activityLogsData]
      .filter((log) => {
        const matchesSearch =
          !term ||
          log.time.toLowerCase().includes(term) ||
          log.type.toLowerCase().includes(term) ||
          log.title.toLowerCase().includes(term) ||
          log.description.toLowerCase().includes(term) ||
          log.user.toLowerCase().includes(term) ||
          log.printer.toLowerCase().includes(term) ||
          log.status.toLowerCase().includes(term) ||
          (log.documentName ?? "").toLowerCase().includes(term) ||
          (log.location ?? "").toLowerCase().includes(term);

        const matchesType =
          typeFilter === "all" ? true : log.type === typeFilter;

        const matchesStatus =
          statusFilter === "all" ? true : log.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        const getValue = (item: ActivityLogItem) => {
          switch (sortKey) {
            case "time":
              return item.time.toLowerCase();
            case "type":
              return item.type.toLowerCase();
            case "title":
              return item.title.toLowerCase();
            case "user":
              return item.user.toLowerCase();
            case "printer":
              return item.printer.toLowerCase();
            case "pages":
              return item.pages ?? -1;
            case "status":
              return activityLogStatusSortOrder[item.status];
            default:
              return item.time.toLowerCase();
          }
        };

        const aValue = getValue(a);
        const bValue = getValue(b);

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDir === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDir === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [search, sortKey, sortDir, typeFilter, statusFilter]);

  const selectedLogs = useMemo(
    () => activityLogsData.filter((log) => selectedIds.includes(log.id)),
    [selectedIds]
  );

  const allVisibleIds = filteredLogs.map((log) => log.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const removeSelectedLogFromAction = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const actionLogs = useMemo(() => {
    if (actionModal === "export-selected") {
      return selectedLogs;
    }

    return [];
  }, [actionModal, selectedLogs]);

  const downloadBlob = (content: BlobPart, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const buildExportRows = (rows: ActivityLogItem[]) => {
    return rows.map((log) => ({
      Time: log.time,
      Type: log.type,
      Event: log.title,
      Description: log.description,
      User: log.user,
      Printer: log.printer,
      Pages: log.pages ?? "—",
      Status: log.status,
      "Document Name": log.documentName ?? "—",
      "Queue Name": log.queueName ?? "—",
      Location: log.location ?? "—",
    }));
  };

  const handleExportSelected = () => {
    const rows = buildExportRows(actionLogs);
    if (rows.length === 0) return;

    const fileBase = `activity-logs-${new Date().toISOString().slice(0, 10)}`;

    if (exportMethod === "CSV") {
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map(
              (header) =>
                `"${String(row[header as keyof typeof row]).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
        ),
      ].join("\n");

      downloadBlob(csv, `${fileBase}.csv`, "text/csv;charset=utf-8");
      setActionModal(null);
      return;
    }

    if (exportMethod === "Excel") {
      const headers = Object.keys(rows[0]);

      const tableHtml = `
        <table border="1">
          <thead>
            <tr>
              ${headers.map((header) => `<th>${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    ${headers
                      .map(
                        (header) =>
                          `<td>${String(row[header as keyof typeof row])}</td>`
                      )
                      .join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `;

      downloadBlob(
        tableHtml,
        `${fileBase}.xls`,
        "application/vnd.ms-excel;charset=utf-8"
      );
      setActionModal(null);
      return;
    }

    const headers = Object.keys(rows[0]);

    const printableHtml = `
      <html>
        <head>
          <title>Activity Logs Export</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #0f172a;
            }
            h1 {
              margin-bottom: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background: #f1f5f9;
            }
          </style>
        </head>
        <body>
          <h1>Activity Logs Export</h1>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `
                    <tr>
                      ${headers
                        .map(
                          (header) =>
                            `<td>${String(
                              row[header as keyof typeof row]
                            )}</td>`
                        )
                        .join("")}
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);

    setActionModal(null);
  };

  return (
    <>
      <Table>
        <TableTop>
          <TableTitleBlock
            title="Activity Log"
            description={`${filteredLogs.length} entries`}
          />

          <TableControls>
            <TableSearch
              id="search-activity-logs"
              label="Search logs..."
              value={search}
              onChange={setSearch}
              wrapperClassName="w-full md:w-[330px]"
            />

            <Dropdown
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as ActivityLogTypeFilter)
              }
            >
              <DropdownTrigger className="h-14 min-w-[170px] rounded-2xl px-5 text-base">
                {activityLogTypeOptions.find(
                  (item) => item.value === typeFilter
                )?.label ?? "All Types"}
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[220px]">
                {activityLogTypeOptions.map((item) => (
                  <DropdownItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <Dropdown
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ActivityLogStatusFilter)
              }
            >
              <DropdownTrigger className="h-14 min-w-[180px] rounded-2xl px-5 text-base">
                {activityLogStatusOptions.find(
                  (item) => item.value === statusFilter
                )?.label ?? "All Statuses"}
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[220px]">
                {activityLogStatusOptions.map((item) => (
                  <DropdownItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <Dropdown
              onValueChange={(value) => setActionModal(value as ActionValue)}
            >
              <DropdownTrigger className="h-14 min-w-[170px] rounded-2xl px-5 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[240px]">
                <DropdownItem
                  value="export-selected"
                  className="py-4 text-base"
                >
                  Export selected
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1572px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {activityLogColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  label={column.label}
                  sortable={column.sortable}
                  active={sortKey === column.key}
                  direction={sortDir}
                  onClick={() => handleSort(column.key)}
                />
              ))}
            </TableHeader>

            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableEmptyState text="No activity logs found" />
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedIds.includes(log.id);

                  return (
                    <div
                      key={log.id}
                      onClick={() => {
                        setOpenLogModal(log);
                        setShowDeviceIp(false);
                        setShowSerialNumber(false);
                      }}
                      className={`grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(log.id)}
                        />
                      </TableCell>

                      <TableCell className="paragraph font-medium text-[var(--muted)]">
                        {log.time}
                      </TableCell>

                      <TableCell>
                        <LogTypeBadge type={log.type} />
                      </TableCell>

                      <TableCell className="min-w-0">
                        <div className="min-w-0">
                          <p className="paragraph truncate font-semibold text-[var(--foreground)]">
                            {log.title}
                          </p>
                          <p className="paragraph mt-1 truncate text-[var(--muted)]">
                            {log.description}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="paragraph">{log.user}</TableCell>

                      <TableCell className="paragraph">{log.printer}</TableCell>

                      <TableCell className="paragraph font-semibold">
                        {log.pages ?? "—"}
                      </TableCell>

                      <TableCell>
                        <LogStatusBadge status={log.status} />
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      <Modal
        open={Boolean(openLogModal)}
        onClose={() => {
          setOpenLogModal(null);
          setShowDeviceIp(false);
          setShowSerialNumber(false);
        }}
      >
        <div className="min-w-[320px] space-y-6 md:min-w-[760px]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              {openLogModal ? <LogTypeBadge type={openLogModal.type} /> : null}
              {openLogModal ? (
                <LogStatusBadge status={openLogModal.status} />
              ) : null}
            </div>

            <h3 className="title-md">{openLogModal?.title}</h3>
            <p className="paragraph">{openLogModal?.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailRow label="Time" value={openLogModal?.time} />
            <DetailRow label="User" value={openLogModal?.user} />
            <DetailRow label="Printer" value={openLogModal?.printer} />
            <DetailRow label="Pages" value={openLogModal?.pages ?? "—"} />
            <DetailRow
              label="Document Name"
              value={openLogModal?.documentName}
            />
            <DetailRow
              label="Device IP"
              value={openLogModal?.deviceIp}
              hidden
              revealed={showDeviceIp}
              onToggleReveal={() => setShowDeviceIp((prev) => !prev)}
            />
            <DetailRow label="Queue Name" value={openLogModal?.queueName} />
            <DetailRow
              label="Serial Number"
              value={openLogModal?.serialNumber}
              hidden
              revealed={showSerialNumber}
              onToggleReveal={() => setShowSerialNumber((prev) => !prev)}
            />
            <DetailRow label="Location" value={openLogModal?.location} />
          </div>

          {openLogModal?.resolutionNote ? (
            <div
              className="rounded-2xl px-4 py-4"
              style={{ background: "var(--surface-2)" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-500" />
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Resolution / Note
                </p>
              </div>

              <p className="text-sm text-[var(--paragraph)]">
                {openLogModal.resolutionNote}
              </p>
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal open={Boolean(actionModal)} onClose={() => setActionModal(null)}>
        {actionModal === "export-selected" ? (
          <div className="w-[min(92vw,900px)] space-y-6 pr-4">
            <div
              className="border-b pb-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <FileOutput className="h-5 w-5 text-brand-500" />
                Export selected logs
              </h3>
              <p className="paragraph mt-2">
                Review the logs to export, remove any row if needed, then choose
                the export format.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{actionLogs.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {actionLogs.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No logs selected.
                  </div>
                ) : (
                  actionLogs.map((log) => (
                    <LogItemCard
                      key={log.id}
                      log={log}
                      subtitle={`${log.type} • ${log.time}`}
                      onRemove={() => removeSelectedLogFromAction(log.id)}
                    />
                  ))
                )}
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Export Method
                </p>

                <Dropdown
                  value={exportMethod}
                  onValueChange={(value) =>
                    setExportMethod(value as ExportMethod)
                  }
                  fullWidth
                >
                  <DropdownTrigger className="h-12 w-full">
                    {exportMethod}
                  </DropdownTrigger>

                  <DropdownContent widthClassName="w-full">
                    <DropdownItem value="PDF">PDF</DropdownItem>
                    <DropdownItem value="CSV">CSV</DropdownItem>
                    <DropdownItem value="Excel">Excel</DropdownItem>
                  </DropdownContent>
                </Dropdown>

                <p className="mt-4 text-sm text-[var(--muted)]">
                  Selected format:{" "}
                  <span className="font-semibold text-[var(--title)]">
                    {exportMethod}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleExportSelected}
                className="px-8"
                disabled={actionLogs.length === 0}
              >
                Export
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default ActivityLogTable;
