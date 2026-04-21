// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   CheckCircle2,
//   FileText,
//   Play,
//   RefreshCw,
//   SlidersHorizontal,
// } from "lucide-react";
// import Modal from "@/app/components/ui/modal/Modal";
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
//   TableCheckbox,
//   TableControls,
//   TableEmptyState,
//   TableGrid,
//   TableHeader,
//   TableHeaderCell,
//   TableMain,
//   TableSearch,
//   TableTop,
// } from "@/app/components/shared/table/Table";
// import {
//   PrintReleaseItem,
//   PrintReleaseSortKey,
//   printReleaseColumns,
//   printReleaseData,
// } from "@/Data/Admin/printRelease";
// import Button from "@/app/components/ui/button/Button";

// type SortDir = "asc" | "desc";
// type ActionValue =
//   | "release-all"
//   | "release-selected"
//   | "delete-selected"
//   | "export-queue";

// const columnsClassName =
//   "[grid-template-columns:72px_150px_minmax(250px,1.3fr)_minmax(280px,1.5fr)_minmax(180px,1fr)_150px_150px]";

// const TOTAL_SECONDS = 30;

// function StatusBadge({ status }: { status: string }) {
//   return (
//     <span className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium status-warning">
//       {status}
//     </span>
//   );
// }

// function OptionPill({ label }: { label: string }) {
//   return (
//     <span
//       className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium"
//       style={{
//         background: "var(--surface)",
//         color: "var(--muted)",
//         border: "1px solid var(--border)",
//       }}
//     >
//       {label}
//     </span>
//   );
// }

// {
//   /*function SecondaryButton({
//   children,
//   onClick,
// }: {
//   children: React.ReactNode;
//   onClick: () => void;
// }) {
//   return (
//     <button onClick={onClick} className="btn-secondary h-12 px-5 text-base">
//       {children}
//     </button>
//   );
// }*/
// }

// {
//   /*function ReleaseButton({ onClick }: { onClick: () => void }) {
//   return (
//     <button
//       type="button"
//       onClick={(e) => {
//         e.stopPropagation();
//         onClick();
//       }}
//       className="btn-primary h-10 px-4 text-sm"
//     >
//       <Play className="mr-2 h-4 w-4" />
//       Release
//     </button>
//   );
// }*/
// }

// function ReleaseButton({ onClick }: { onClick: () => void }) {
//   return (
//     <Button
//       variant="primary"
//       iconLeft={<Play className="h-4 w-4" />}
//       className="h-10 px-4 text-sm"
//       onClick={(e) => {
//         e.stopPropagation();
//         onClick();
//       }}
//     >
//       Release
//     </Button>
//   );
// }
// {
//   /*Special Button not related to Button*/
// }
// function RefreshTimer({
//   secondsLeft,
//   onRefreshNow,
// }: {
//   secondsLeft: number;
//   onRefreshNow: () => void;
// }) {
//   const progress = secondsLeft / TOTAL_SECONDS;
//   const radius = 16;
//   const circumference = 2 * Math.PI * radius;
//   const dashOffset = circumference * (1 - progress);
//   const done = secondsLeft === 0;

//   return (
//     <button
//       type="button"
//       onClick={onRefreshNow}
//       className="btn-secondary h-12 gap-3 px-4"
//     >
//       <span className="relative flex h-6 w-6 items-center justify-center">
//         {done ? (
//           <CheckCircle2 className="h-5 w-5 text-success-500" />
//         ) : (
//           <>
//             <svg className="h-6 w-6 -rotate-90" viewBox="0 0 40 40">
//               <circle
//                 cx="20"
//                 cy="20"
//                 r={radius}
//                 fill="none"
//                 stroke="rgba(148,163,184,0.25)"
//                 strokeWidth="4"
//               />
//               <circle
//                 cx="20"
//                 cy="20"
//                 r={radius}
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="4"
//                 strokeLinecap="round"
//                 strokeDasharray={circumference}
//                 strokeDashoffset={dashOffset}
//                 className="text-brand-500 transition-all duration-1000 ease-linear"
//               />
//             </svg>
//             <RefreshCw className="absolute h-3.5 w-3.5 text-brand-500" />
//           </>
//         )}
//       </span>

//       <span className="font-medium">
//         {done ? "Updated" : `${secondsLeft}s`}
//       </span>
//     </button>
//   );
// }

// const PrintReleaseTable = () => {
//   const [search, setSearch] = useState("");
//   const [sortKey, setSortKey] = useState<PrintReleaseSortKey>("jobId");
//   const [sortDir, setSortDir] = useState<SortDir>("asc");
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

//   const [openJobModal, setOpenJobModal] = useState<PrintReleaseItem | null>(
//     null
//   );
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
//   const [actionModal, setActionModal] = useState<ActionValue | null>(null);
//   const [releasedJob, setReleasedJob] = useState<PrintReleaseItem | null>(null);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setSecondsLeft((prev) => {
//         if (prev <= 0) return TOTAL_SECONDS;
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const handleRefreshNow = () => {
//     setSecondsLeft(0);
//     setTimeout(() => {
//       setSecondsLeft(TOTAL_SECONDS);
//     }, 900);
//   };

//   const handleSort = (key: PrintReleaseSortKey) => {
//     if (sortKey === key) {
//       setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
//       return;
//     }

//     setSortKey(key);
//     setSortDir("asc");
//   };

//   const toggleRowSelection = (id: string) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   };

//   const filteredJobs = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return [...printReleaseData]
//       .filter((job) => {
//         if (!term) return true;

//         return (
//           job.jobId.toLowerCase().includes(term) ||
//           job.userName.toLowerCase().includes(term) ||
//           job.userEmail.toLowerCase().includes(term) ||
//           job.documentName.toLowerCase().includes(term) ||
//           job.printerName.toLowerCase().includes(term)
//         );
//       })
//       .sort((a, b) => {
//         const getSortValue = (item: PrintReleaseItem) => {
//           switch (sortKey) {
//             case "jobId":
//               return item.jobId.toLowerCase();
//             case "userName":
//               return item.userName.toLowerCase();
//             case "documentName":
//               return item.documentName.toLowerCase();
//             case "printerName":
//               return item.printerName.toLowerCase();
//             case "status":
//               return item.status.toLowerCase();
//             default:
//               return item.jobId.toLowerCase();
//           }
//         };

//         const aValue = getSortValue(a);
//         const bValue = getSortValue(b);

//         return sortDir === "asc"
//           ? String(aValue).localeCompare(String(bValue))
//           : String(bValue).localeCompare(String(aValue));
//       });
//   }, [search, sortKey, sortDir]);

//   const allVisibleIds = filteredJobs.map((job) => job.id);
//   const isAllSelected =
//     allVisibleIds.length > 0 &&
//     allVisibleIds.every((id) => selectedIds.includes(id));

//   const toggleSelectAll = () => {
//     if (isAllSelected) {
//       setSelectedIds((prev) =>
//         prev.filter((id) => !allVisibleIds.includes(id))
//       );
//       return;
//     }

//     setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
//   };

//   const actionTitleMap: Record<ActionValue, string> = {
//     "release-all": "Release all",
//     "release-selected": "Release selected",
//     "delete-selected": "Delete selected",
//     "export-queue": "Export queue",
//   };

//   return (
//     <>
//       <Table>
//         <TableTop className="pb-4">
//           <p className="paragraph mt-1">{`${filteredJobs.length} jobs in queue`}</p>

//           <TableControls>
//             <TableSearch
//               id="search-print-release"
//               label="Search by user, document, printer..."
//               value={search}
//               onChange={setSearch}
//               wrapperClassName="w-full md:w-[440px]"
//             />

//             <RefreshTimer
//               secondsLeft={secondsLeft}
//               onRefreshNow={handleRefreshNow}
//             />

//             {/*<SecondaryButton onClick={() => setIsFilterModalOpen(true)}>
//               <SlidersHorizontal className="mr-2 h-5 w-5" />
//               Filter
//             </SecondaryButton>*/}

//             <Button
//               variant="outline"
//               iconLeft={<SlidersHorizontal className="h-4 w-4" />}
//               className="h-12 px-5 text-base"
//               onClick={() => setIsFilterModalOpen(true)}
//             >
//               Filter
//             </Button>

//             <Dropdown
//               onValueChange={(value) => setActionModal(value as ActionValue)}
//             >
//               <DropdownTrigger className="h-12 min-w-[170px] px-5 text-base">
//                 Actions
//               </DropdownTrigger>

//               <DropdownContent align="right" widthClassName="w-[260px]">
//                 <DropdownItem value="release-all" className="py-4 text-lg">
//                   Release all
//                 </DropdownItem>
//                 <DropdownItem value="release-selected" className="py-4 text-lg">
//                   Release selected
//                 </DropdownItem>
//                 <DropdownItem value="delete-selected" className="py-4 text-lg">
//                   Delete selected
//                 </DropdownItem>
//                 <DropdownItem value="export-queue" className="py-4 text-lg">
//                   Export queue
//                 </DropdownItem>
//               </DropdownContent>
//             </Dropdown>
//           </TableControls>
//         </TableTop>

//         <TableMain>
//           <TableGrid minWidthClassName="min-w-[1242px]">
//             <TableHeader columnsClassName={columnsClassName}>
//               <TableCell className="justify-center">
//                 <TableCheckbox
//                   checked={isAllSelected}
//                   onToggle={toggleSelectAll}
//                 />
//               </TableCell>

//               {printReleaseColumns.map((column) => (
//                 <TableHeaderCell
//                   key={column.key}
//                   label={column.label}
//                   sortable={column.sortable}
//                   active={sortKey === column.key}
//                   direction={sortDir}
//                   onClick={() => handleSort(column.key)}
//                 />
//               ))}

//               <div
//                 className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs"
//                 style={{ color: "var(--muted)" }}
//               >
//                 Release
//               </div>
//             </TableHeader>

//             <TableBody>
//               {filteredJobs.length === 0 ? (
//                 <TableEmptyState text="No jobs found" />
//               ) : (
//                 filteredJobs.map((job) => {
//                   const isSelected = selectedIds.includes(job.id);

//                   return (
//                     <div
//                       key={job.id}
//                       onClick={() => setOpenJobModal(job)}
//                       className={`grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-4 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
//                     >
//                       <TableCell className="justify-center">
//                         <TableCheckbox
//                           checked={isSelected}
//                           onToggle={() => toggleRowSelection(job.id)}
//                         />
//                       </TableCell>

//                       <TableCell className="min-w-0 paragraph font-medium">
//                         <span className="block truncate">{job.jobId}</span>
//                       </TableCell>

//                       <TableCell className="min-w-0 flex-col items-start gap-0.5">
//                         <span className="block truncate text-sm font-semibold text-[var(--title)]">
//                           {job.userName}
//                         </span>
//                         <span className="block truncate text-sm text-[var(--muted)]">
//                           {job.userEmail}
//                         </span>
//                       </TableCell>

//                       <TableCell className="min-w-0 gap-2">
//                         <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
//                         <span className="paragraph block truncate">
//                           {job.documentName}
//                         </span>
//                       </TableCell>

//                       <TableCell className="min-w-0">
//                         <span className="paragraph block truncate">
//                           {job.printerName}
//                         </span>
//                       </TableCell>

//                       <TableCell>
//                         <StatusBadge status={job.status} />
//                       </TableCell>

//                       <TableCell>
//                         <ReleaseButton onClick={() => setReleasedJob(job)} />
//                       </TableCell>
//                     </div>
//                   );
//                 })
//               )}
//             </TableBody>
//           </TableGrid>
//         </TableMain>
//       </Table>

//       <Modal open={Boolean(openJobModal)} onClose={() => setOpenJobModal(null)}>
//         <div className="space-y-5 pr-8">
//           <div>
//             <h3 className="title-md">{openJobModal?.jobId}</h3>
//             <p className="paragraph mt-1">
//               Review job details and manage secure release.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <div>
//               <p className="text-sm font-medium text-[var(--muted)]">User</p>
//               <p className="paragraph mt-1">{openJobModal?.userName}</p>
//               <p className="text-sm text-[var(--muted)]">
//                 {openJobModal?.userEmail}
//               </p>
//             </div>

//             <div>
//               <p className="text-sm font-medium text-[var(--muted)]">Printer</p>
//               <p className="paragraph mt-1">{openJobModal?.printerName}</p>
//             </div>

//             <div>
//               <p className="text-sm font-medium text-[var(--muted)]">
//                 Document
//               </p>
//               <p className="paragraph mt-1">{openJobModal?.documentName}</p>
//             </div>

//             <div>
//               <p className="text-sm font-medium text-[var(--muted)]">Status</p>
//               <div className="mt-2">
//                 {openJobModal?.status ? (
//                   <StatusBadge status={openJobModal.status} />
//                 ) : null}
//               </div>
//             </div>

//             <div>
//               <p className="text-sm font-medium text-[var(--muted)]">Pages</p>
//               <p className="paragraph mt-1">{openJobModal?.pages ?? "-"}</p>
//             </div>

//             <div>
//               <p className="text-sm font-medium text-[var(--muted)]">
//                 Submitted
//               </p>
//               <p className="paragraph mt-1">{openJobModal?.submittedAt}</p>
//             </div>
//           </div>

//           <div>
//             <p className="text-sm font-medium text-[var(--muted)]">
//               Print Options
//             </p>

//             <div className="mt-3 flex flex-wrap gap-2">
//               {openJobModal?.options?.length ? (
//                 openJobModal.options.map((option) => (
//                   <OptionPill key={option} label={option} />
//                 ))
//               ) : (
//                 <p className="paragraph">No special options</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         open={isFilterModalOpen}
//         onClose={() => setIsFilterModalOpen(false)}
//       >
//         <div className="space-y-3 pr-8">
//           <h3 className="title-md">Filter Print Queue</h3>
//           <p className="paragraph">...</p>
//         </div>
//       </Modal>

//       <Modal open={Boolean(actionModal)} onClose={() => setActionModal(null)}>
//         <div className="space-y-3 pr-8">
//           <h3 className="title-md">
//             {actionModal ? actionTitleMap[actionModal] : "Action"}
//           </h3>
//           <p className="paragraph">... </p>
//           <p className="paragraph">
//             Selected rows:{" "}
//             <span className="font-semibold">{selectedIds.length}</span>
//           </p>
//         </div>
//       </Modal>

//       <Modal open={Boolean(releasedJob)} onClose={() => setReleasedJob(null)}>
//         <div className="space-y-3 pr-8">
//           <h3 className="title-md">Release Job</h3>
//           <p className="paragraph">{releasedJob?.jobId}</p>
//           <p className="paragraph">
//             Confirm secure release for this print job.
//           </p>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default PrintReleaseTable;

// ============New===============
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileOutput,
  FileText,
  Filter,
  Play,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { RiDeleteBin6Line, RiPlayLine } from "react-icons/ri";
import Modal from "@/app/components/ui/modal/Modal";
import Input from "@/app/components/ui/input/Input";
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
  TableTop,
} from "@/app/components/shared/table/Table";
import {
  PrintJobStatus,
  PrintReleaseItem,
  PrintReleaseSortKey,
  printReleaseColumns,
  printReleaseData,
  printReleasePrinterOptions,
  printReleaseStatusOptions,
  printReleaseStatusSortOrder,
} from "@/Data/Admin/printRelease";

type SortDir = "asc" | "desc";
type ActionValue =
  | "release-all"
  | "release-selected"
  | "delete-selected"
  | "export-queue";
type ExportMethod = "PDF" | "CSV" | "Excel";

const columnsClassName =
  "[grid-template-columns:72px_150px_minmax(250px,1.3fr)_minmax(280px,1.5fr)_minmax(180px,1fr)_150px_132px]";

const TOTAL_SECONDS = 30;

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium"
      style={{
        background: "var(--surface-2)",
        color: "var(--title)",
        border: "1px solid var(--border)",
      }}
    >
      {status}
    </span>
  );
}

function OptionPill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium"
      style={{
        background: "var(--surface)",
        color: "var(--muted)",
        border: "1px solid var(--border)",
      }}
    >
      {label}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold text-[var(--title)] sm:text-base">
        {value}
      </div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition"
      style={{
        borderColor: "var(--border)",
        background: checked ? "rgba(55, 125, 255, 0.08)" : "var(--surface-2)",
      }}
    >
      <span className="text-sm font-medium text-[var(--title)]">{label}</span>

      <span
        className={`flex h-5 w-5 items-center justify-center rounded border transition ${
          checked ? "border-brand-500 bg-brand-500" : ""
        }`}
        style={{
          borderColor: checked ? "var(--color-brand-500)" : "var(--border)",
        }}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
    </button>
  );
}

function QueueItemCard({
  job,
  subtitle,
  removeLabel = "Remove",
  onRemove,
}: {
  job: PrintReleaseItem;
  subtitle: string;
  removeLabel?: string;
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
          {job.documentName}
        </p>
        <p className="truncate text-sm text-[var(--muted)]">{subtitle}</p>
      </div>

      <ExpandedButton
        id={`remove-${job.id}`}
        label={removeLabel}
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

function ReleaseButton({ onClick, id }: { onClick: () => void; id: string }) {
  return (
    <ExpandedButton
      id={id}
      label="Release"
      icon={RiPlayLine}
      variant="surface"
      className="mx-auto"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    />
  );
}

function RefreshTimer({
  secondsLeft,
  onRefreshNow,
}: {
  secondsLeft: number;
  onRefreshNow: () => void;
}) {
  const progress = secondsLeft / TOTAL_SECONDS;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const done = secondsLeft === 0;

  return (
    <button
      type="button"
      onClick={onRefreshNow}
      className="btn-secondary h-12 gap-3 px-4"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success-500" />
        ) : (
          <>
            <svg className="h-6 w-6 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="4"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="text-brand-500 transition-all duration-1000 ease-linear"
              />
            </svg>
            <RefreshCw className="absolute h-3.5 w-3.5 text-brand-500" />
          </>
        )}
      </span>

      <span className="font-medium">
        {done ? "Updated" : `${secondsLeft}s`}
      </span>
    </button>
  );
}

const PrintReleaseTable = () => {
  const [jobs, setJobs] = useState<PrintReleaseItem[]>(printReleaseData);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<PrintReleaseSortKey>("jobId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  const [openJobModal, setOpenJobModal] = useState<PrintReleaseItem | null>(
    null
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<ActionValue | null>(null);
  const [releasedJob, setReleasedJob] = useState<PrintReleaseItem | null>(null);

  const [releasePrinter, setReleasePrinter] = useState(
    printReleasePrinterOptions[0] ?? ""
  );
  const [releaseCopies, setReleaseCopies] = useState("1");

  const [actionPrinter, setActionPrinter] = useState(
    printReleasePrinterOptions[0] ?? ""
  );
  const [actionCopies, setActionCopies] = useState("1");

  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");

  const [filterStatuses, setFilterStatuses] = useState<PrintJobStatus[]>([]);
  const [filterPrinters, setFilterPrinters] = useState<string[]>([]);
  const [filterColorOnly, setFilterColorOnly] = useState(false);
  const [filterDuplexOnly, setFilterDuplexOnly] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) return TOTAL_SECONDS;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (releasedJob) {
      setReleasePrinter(releasedJob.printerName);
      setReleaseCopies("1");
    }
  }, [releasedJob]);

  useEffect(() => {
    if (actionModal === "release-all" || actionModal === "release-selected") {
      setActionPrinter(printReleasePrinterOptions[0] ?? "");
      setActionCopies("1");
    }

    if (actionModal === "export-queue") {
      setExportMethod("PDF");
    }
  }, [actionModal]);

  const handleRefreshNow = () => {
    setSecondsLeft(0);
    setTimeout(() => {
      setSecondsLeft(TOTAL_SECONDS);
    }, 900);
  };

  const handleSort = (key: PrintReleaseSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFromList = <T,>(
    value: T,
    list: T[],
    setter: (next: T[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
      return;
    }

    setter([...list, value]);
  };

  const resetFilters = () => {
    setFilterStatuses([]);
    setFilterPrinters([]);
    setFilterColorOnly(false);
    setFilterDuplexOnly(false);
  };

  const hasActiveFilters =
    filterStatuses.length > 0 ||
    filterPrinters.length > 0 ||
    filterColorOnly ||
    filterDuplexOnly;

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        const matchesSearch =
          !term ||
          job.jobId.toLowerCase().includes(term) ||
          job.userName.toLowerCase().includes(term) ||
          job.userEmail.toLowerCase().includes(term) ||
          job.documentName.toLowerCase().includes(term) ||
          job.printerName.toLowerCase().includes(term);

        const matchesStatus =
          filterStatuses.length === 0 || filterStatuses.includes(job.status);

        const matchesPrinter =
          filterPrinters.length === 0 ||
          filterPrinters.includes(job.printerName);

        const matchesColor =
          !filterColorOnly ||
          job.options.some((option) => option.toLowerCase() === "color");

        const matchesDuplex =
          !filterDuplexOnly ||
          job.options.some((option) => option.toLowerCase() === "duplex");

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPrinter &&
          matchesColor &&
          matchesDuplex
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: PrintReleaseItem) => {
          switch (sortKey) {
            case "jobId":
              return item.jobId.toLowerCase();
            case "userName":
              return item.userName.toLowerCase();
            case "documentName":
              return item.documentName.toLowerCase();
            case "printerName":
              return item.printerName.toLowerCase();
            case "status":
              return printReleaseStatusSortOrder[item.status];
            default:
              return item.jobId.toLowerCase();
          }
        };

        const aValue = getSortValue(a);
        const bValue = getSortValue(b);

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDir === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDir === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [
    jobs,
    search,
    sortKey,
    sortDir,
    filterStatuses,
    filterPrinters,
    filterColorOnly,
    filterDuplexOnly,
  ]);

  const selectedJobs = useMemo(
    () => jobs.filter((job) => selectedIds.includes(job.id)),
    [jobs, selectedIds]
  );

  const actionJobs = useMemo(() => {
    if (actionModal === "release-all") {
      return filteredJobs;
    }

    if (
      actionModal === "release-selected" ||
      actionModal === "delete-selected"
    ) {
      return selectedJobs;
    }

    if (actionModal === "export-queue") {
      return selectedJobs.length > 0 ? selectedJobs : filteredJobs;
    }

    return [];
  }, [actionModal, filteredJobs, selectedJobs]);

  const allVisibleIds = filteredJobs.map((job) => job.id);
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

  const removeSelectedJobFromAction = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleReleaseSingleJob = () => {
    if (!releasedJob) return;

    setJobs((prev) => prev.filter((job) => job.id !== releasedJob.id));
    setSelectedIds((prev) => prev.filter((id) => id !== releasedJob.id));
    setReleasedJob(null);
  };

  const handleReleaseActionJobs = () => {
    if (actionJobs.length === 0) return;

    const idsToRemove = actionJobs.map((job) => job.id);

    setJobs((prev) => prev.filter((job) => !idsToRemove.includes(job.id)));
    setSelectedIds((prev) => prev.filter((id) => !idsToRemove.includes(id)));
    setActionModal(null);
  };

  const handleDeleteSelected = () => {
    if (selectedJobs.length === 0) return;

    const idsToDelete = selectedJobs.map((job) => job.id);

    setJobs((prev) => prev.filter((job) => !idsToDelete.includes(job.id)));
    setSelectedIds([]);
    setActionModal(null);
  };

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

  const buildExportRows = (rows: PrintReleaseItem[]) => {
    return rows.map((job) => ({
      "Job ID": job.jobId,
      User: job.userName,
      Email: job.userEmail,
      Document: job.documentName,
      Printer: job.printerName,
      Pages: job.pages,
      Status: job.status,
      Options: job.options.join(", "),
      Submitted: job.submittedAt,
    }));
  };

  const handleExportQueue = () => {
    const rows = buildExportRows(actionJobs);
    if (rows.length === 0) return;

    const fileBase = `print-release-queue-${new Date()
      .toISOString()
      .slice(0, 10)}`;

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
          <title>Print Release Queue Export</title>
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
          <h1>Print Release Queue Export</h1>
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
        <TableTop className="pb-4">
          <p className="paragraph mt-1">
            {hasActiveFilters
              ? `${filteredJobs.length} filtered job${
                  filteredJobs.length === 1 ? "" : "s"
                } in queue`
              : `${filteredJobs.length} jobs in queue`}
          </p>

          <TableControls>
            <TableSearch
              id="search-print-release"
              label="Search by user, document, printer..."
              value={search}
              onChange={setSearch}
              wrapperClassName="w-full md:w-[440px]"
            />

            <RefreshTimer
              secondsLeft={secondsLeft}
              onRefreshNow={handleRefreshNow}
            />

            <Button
              variant="outline"
              iconLeft={<SlidersHorizontal className="h-4 w-4" />}
              className="h-12 px-5 text-base"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filter
            </Button>

            <Dropdown
              onValueChange={(value) => setActionModal(value as ActionValue)}
            >
              <DropdownTrigger className="h-12 min-w-[170px] px-5 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[260px]">
                <DropdownItem value="release-all" className="py-4 text-lg">
                  Release all
                </DropdownItem>
                <DropdownItem value="release-selected" className="py-4 text-lg">
                  Release selected
                </DropdownItem>
                <DropdownItem value="delete-selected" className="py-4 text-lg">
                  Delete selected
                </DropdownItem>
                <DropdownItem value="export-queue" className="py-4 text-lg">
                  Export queue
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1204px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {printReleaseColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  label={column.label}
                  sortable={column.sortable}
                  active={sortKey === column.key}
                  direction={sortDir}
                  onClick={() => handleSort(column.key)}
                />
              ))}

              <div
                className="flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs"
                style={{ color: "var(--muted)" }}
              >
                Release
              </div>
            </TableHeader>

            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableEmptyState text="No jobs found" />
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedIds.includes(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setOpenJobModal(job)}
                      className={`grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-4 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(job.id)}
                        />
                      </TableCell>

                      <TableCell className="min-w-0 paragraph font-medium">
                        <span className="block truncate">{job.jobId}</span>
                      </TableCell>

                      <TableCell className="min-w-0 flex-col items-start gap-0.5">
                        <span className="block truncate text-sm font-semibold text-[var(--title)]">
                          {job.userName}
                        </span>
                        <span className="block truncate text-sm text-[var(--muted)]">
                          {job.userEmail}
                        </span>
                      </TableCell>

                      <TableCell className="min-w-0 gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <span className="paragraph block truncate">
                          {job.documentName}
                        </span>
                      </TableCell>

                      <TableCell className="min-w-0">
                        <span className="paragraph block truncate">
                          {job.printerName}
                        </span>
                      </TableCell>

                      <TableCell className="justify-center">
                        <StatusBadge status={job.status} />
                      </TableCell>

                      <TableCell className="justify-center">
                        <ReleaseButton
                          id={`release-${job.id}`}
                          onClick={() => setReleasedJob(job)}
                        />
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      <Modal open={Boolean(openJobModal)} onClose={() => setOpenJobModal(null)}>
        <div className="w-[min(92vw,860px)] space-y-6 pr-4">
          <div
            className="border-b pb-5"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="title-md">{openJobModal?.jobId}</h3>
            <p className="paragraph mt-1">
              Review job details and manage secure release.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="User" value={openJobModal?.userName ?? "-"} />
            <InfoCard label="Email" value={openJobModal?.userEmail ?? "-"} />
            <InfoCard
              label="Printer"
              value={openJobModal?.printerName ?? "-"}
            />
            <InfoCard
              label="Document"
              value={openJobModal?.documentName ?? "-"}
            />
            <InfoCard label="Pages" value={openJobModal?.pages ?? "-"} />
            <InfoCard
              label="Submitted"
              value={openJobModal?.submittedAt ?? "-"}
            />
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Print Options
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {openJobModal?.options?.length ? (
                openJobModal.options.map((option) => (
                  <OptionPill key={option} label={option} />
                ))
              ) : (
                <p className="paragraph">No special options</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(releasedJob)} onClose={() => setReleasedJob(null)}>
        {releasedJob ? (
          <div className="w-[min(92vw,860px)] space-y-6 pr-4">
            <div
              className="border-b pb-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <Play className="h-5 w-5 text-brand-500" />
                Release Job
              </h3>
              <p className="paragraph mt-2">
                Choose the destination printer and confirm the secure release
                for this job.
              </p>
              <p className="paragraph mt-2">
                Job ID:{" "}
                <span className="font-semibold">{releasedJob.jobId}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <QueueItemCard
                  job={releasedJob}
                  subtitle={`${releasedJob.userName} • ${releasedJob.pages} pages`}
                  removeLabel="Close"
                  onRemove={() => setReleasedJob(null)}
                />

                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Destination Printer
                  </p>

                  <Dropdown
                    value={releasePrinter}
                    onValueChange={setReleasePrinter}
                    fullWidth
                  >
                    <DropdownTrigger className="h-12 w-full">
                      {releasePrinter}
                    </DropdownTrigger>

                    <DropdownContent widthClassName="w-full">
                      {printReleasePrinterOptions.map((printer) => (
                        <DropdownItem key={printer} value={printer}>
                          {printer}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Copies
                  </p>

                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={releaseCopies}
                    onChange={(e) => setReleaseCopies(e.target.value)}
                    placeholder="1"
                  />

                  <p className="mt-3 text-sm text-[var(--muted)]">
                    Selected printer:{" "}
                    <span className="font-semibold text-[var(--title)]">
                      {releasePrinter}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReleasedJob(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleReleaseSingleJob}
                className="px-8"
                disabled={releasePrinter.trim() === ""}
              >
                Release
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <div className="w-[min(92vw,900px)] space-y-6 pr-4">
          <div
            className="border-b pb-5"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="title-md flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Print Queue
            </h3>
            <p className="paragraph mt-1">
              Narrow the queue by status, printer, and print options.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Status
              </h4>

              <div className="grid gap-3">
                {printReleaseStatusOptions.map((status) => (
                  <FilterCheckbox
                    key={status}
                    label={status}
                    checked={filterStatuses.includes(status)}
                    onChange={() =>
                      toggleFromList(status, filterStatuses, setFilterStatuses)
                    }
                  />
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Printer
              </h4>

              <div className="grid gap-3">
                {printReleasePrinterOptions.map((printer) => (
                  <FilterCheckbox
                    key={printer}
                    label={printer}
                    checked={filterPrinters.includes(printer)}
                    onChange={() =>
                      toggleFromList(printer, filterPrinters, setFilterPrinters)
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Print Options
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <FilterCheckbox
                label="Color only"
                checked={filterColorOnly}
                onChange={() => setFilterColorOnly((prev) => !prev)}
              />
              <FilterCheckbox
                label="Duplex only"
                checked={filterDuplexOnly}
                onChange={() => setFilterDuplexOnly((prev) => !prev)}
              />
            </div>
          </div>

          <div
            className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="paragraph flex items-center gap-2">
              {hasActiveFilters ? (
                <>
                  <Filter className="h-4 w-4" />
                  Active filters applied
                </>
              ) : (
                <>
                  <SearchX className="h-4 w-4" />
                  No filters applied
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>

              <Button onClick={() => setIsFilterModalOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(actionModal)} onClose={() => setActionModal(null)}>
        {actionModal === "release-all" || actionModal === "release-selected" ? (
          <div className="w-[min(92vw,860px)] space-y-6 pr-4">
            <div
              className="border-b pb-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <Play className="h-5 w-5 text-brand-500" />
                {actionModal === "release-all"
                  ? "Release all jobs"
                  : "Release selected jobs"}
              </h3>
              <p className="paragraph mt-2">
                Choose the destination printer, review the queue items, then
                confirm the release.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{actionJobs.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {actionJobs.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No jobs available.
                  </div>
                ) : (
                  actionJobs.map((job) => (
                    <QueueItemCard
                      key={job.id}
                      job={job}
                      subtitle={`${job.userName} • ${job.printerName}`}
                      onRemove={() => removeSelectedJobFromAction(job.id)}
                    />
                  ))
                )}
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Destination Printer
                  </p>

                  <Dropdown
                    value={actionPrinter}
                    onValueChange={setActionPrinter}
                    fullWidth
                  >
                    <DropdownTrigger className="h-12 w-full">
                      {actionPrinter}
                    </DropdownTrigger>

                    <DropdownContent widthClassName="w-full">
                      {printReleasePrinterOptions.map((printer) => (
                        <DropdownItem key={printer} value={printer}>
                          {printer}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>

                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Copies
                  </p>

                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={actionCopies}
                    onChange={(e) => setActionCopies(e.target.value)}
                    placeholder="1"
                  />

                  <p className="mt-3 text-sm text-[var(--muted)]">
                    Selected printer:{" "}
                    <span className="font-semibold text-[var(--title)]">
                      {actionPrinter}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleReleaseActionJobs}
                className="px-8"
                disabled={
                  actionJobs.length === 0 || actionPrinter.trim() === ""
                }
              >
                Release
              </Button>
            </div>
          </div>
        ) : null}

        {actionModal === "delete-selected" ? (
          <div className="w-[min(92vw,860px)] space-y-6 pr-4">
            <div
              className="border-b pb-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete selected jobs
              </h3>
              <p className="paragraph mt-2">
                This action will remove the selected jobs from the queue. Review
                the list below and remove any row you do not want to delete.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedJobs.length}</span>
              </p>
            </div>

            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedJobs.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  No jobs selected.
                </div>
              ) : (
                selectedJobs.map((job) => (
                  <QueueItemCard
                    key={job.id}
                    job={job}
                    subtitle={`${job.jobId} • ${job.userName}`}
                    onRemove={() => removeSelectedJobFromAction(job.id)}
                  />
                ))
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSelected}
                className="px-8"
                disabled={selectedJobs.length === 0}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : null}

        {actionModal === "export-queue" ? (
          <div className="w-[min(92vw,900px)] space-y-6 pr-4">
            <div
              className="border-b pb-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <FileOutput className="h-5 w-5 text-brand-500" />
                Export queue
              </h3>
              <p className="paragraph mt-2">
                Review the queue items to export, remove any row if needed, then
                choose the export format.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{actionJobs.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {actionJobs.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No jobs available to export.
                  </div>
                ) : (
                  actionJobs.map((job) => (
                    <QueueItemCard
                      key={job.id}
                      job={job}
                      subtitle={`${job.userName} • ${job.printerName}`}
                      onRemove={() => removeSelectedJobFromAction(job.id)}
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
                onClick={handleExportQueue}
                className="px-8"
                disabled={actionJobs.length === 0}
              >
                Export
              </Button>
            </div>
          </div>
        ) : null}

        {!actionModal ? null : null}
      </Modal>
    </>
  );
};

export default PrintReleaseTable;
