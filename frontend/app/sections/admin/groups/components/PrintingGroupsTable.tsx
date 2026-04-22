// "use client";

// import React, { useMemo, useState } from "react";
// import { Lock, LockOpen, Plus, SlidersHorizontal } from "lucide-react";
// import {
//   Dropdown,
//   DropdownContent,
//   DropdownItem,
//   DropdownTrigger,
// } from "@/components/ui/dropdown/Dropdown";
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
//   TableTitleBlock,
//   TableTop,
// } from "@/components/shared/table/Table";
// import {
//   GroupItem,
//   GroupRestrictedStatus,
//   GroupSortKey,
//   groupColumns,
//   groupPeriodSortOrder,
//   groupRestrictedSortOrder,
//   printingGroupsData,
// } from "@/lib/mock-data/Admin/groups";
// import Button from "@/components/ui/button/Button";
// import StatusBadge from "@/components/ui/badge/StatusBadge";
// import AddGroupModal from "./AddGroupModal";
// import FilterGroupsModal from "./FilterGroupsModal";
// import GroupDetailsModal from "./GroupDetailsModal";
// import GroupActionModal, { type GroupActionValue } from "./GroupActionModal";

// type SortDir = "asc" | "desc";

// const columnsClassName =
//   "[grid-template-columns:72px_minmax(220px,1.5fr)_minmax(130px,0.9fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(200px,1.2fr)_minmax(120px,0.8fr)]";

// const formatMoney = (value: number) => value.toFixed(2);

// function RestrictedBadge({ status }: { status: GroupRestrictedStatus }) {
//   const isUnlocked = status === "Unlocked";

//   return (
//     <StatusBadge
//       label=""
//       tone={isUnlocked ? "success" : "danger"}
//       icon={
//         isUnlocked ? (
//           <LockOpen className="h-5 w-5" />
//         ) : (
//           <Lock className="h-5 w-5" />
//         )
//       }
//       className="justify-center [&>span:first-child]:h-auto [&>span:first-child]:w-auto [&>span:first-child]:rounded-none [&>span:first-child]:border-0"
//     />
//   );
// }

// const PrintingGroupsTable = () => {
//   const [search, setSearch] = useState("");
//   const [sortKey, setSortKey] = useState<GroupSortKey>("name");
//   const [sortDir, setSortDir] = useState<SortDir>("asc");

//   const [selectedIds, setSelectedIds] = useState<string[]>(
//     printingGroupsData
//       .filter((item) => item.selectedByDefault)
//       .map((item) => item.id)
//   );

//   const [openGroupModal, setOpenGroupModal] = useState<GroupItem | null>(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
//   const [actionModal, setActionModal] = useState<GroupActionValue | null>(null);

//   const handleSort = (key: GroupSortKey) => {
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

//   const filteredGroups = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return [...printingGroupsData]
//       .filter((group) => {
//         if (!term) return true;

//         return (
//           group.name.toLowerCase().includes(term) ||
//           group.period.toLowerCase().includes(term) ||
//           group.restricted.toLowerCase().includes(term)
//         );
//       })
//       .sort((a, b) => {
//         const getSortValue = (item: GroupItem) => {
//           switch (sortKey) {
//             case "name":
//               return item.name.toLowerCase();
//             case "members":
//               return item.members;
//             case "initialCredit":
//               return item.initialCredit;
//             case "restricted":
//               return groupRestrictedSortOrder[item.restricted];
//             case "scheduleAmount":
//               return item.scheduleAmount;
//             case "period":
//               return groupPeriodSortOrder[item.period];
//             default:
//               return item.name.toLowerCase();
//           }
//         };

//         const aValue = getSortValue(a);
//         const bValue = getSortValue(b);

//         if (typeof aValue === "number" && typeof bValue === "number") {
//           return sortDir === "asc" ? aValue - bValue : bValue - aValue;
//         }

//         return sortDir === "asc"
//           ? String(aValue).localeCompare(String(bValue))
//           : String(bValue).localeCompare(String(aValue));
//       });
//   }, [search, sortKey, sortDir]);

//   const allVisibleIds = filteredGroups.map((group) => group.id);
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

//   return (
//     <>
//       <Table>
//         <TableTop>
//           <TableTitleBlock title="Printing Groups" />

//           <TableControls>
//             <TableSearch
//               id="search-groups"
//               label="Search groups"
//               value={search}
//               onChange={setSearch}
//             />

//             <Button
//               variant="primary"
//               iconLeft={<Plus className="h-5 w-5" />}
//               className="h-14 px-6 text-base"
//               onClick={() => setIsAddModalOpen(true)}
//             >
//               Add Group
//             </Button>

//             <Button
//               variant="outline"
//               iconLeft={<SlidersHorizontal className="h-4 w-4" />}
//               className="h-14 px-6 text-base"
//               onClick={() => setIsFilterModalOpen(true)}
//             >
//               Filter
//             </Button>

//             <Dropdown
//               onValueChange={(value) =>
//                 setActionModal(value as GroupActionValue)
//               }
//             >
//               <DropdownTrigger className="h-14 min-w-[180px] px-6 text-base">
//                 Actions
//               </DropdownTrigger>

//               <DropdownContent align="right" widthClassName="w-[280px]">
//                 <DropdownItem value="delete-selected" className="py-4 text-lg">
//                   Delete selected
//                 </DropdownItem>
//                 <DropdownItem value="export-groups" className="py-4 text-lg">
//                   Export groups
//                 </DropdownItem>
//                 <DropdownItem value="assign-credits" className="py-4 text-lg">
//                   Assign credits
//                 </DropdownItem>
//               </DropdownContent>
//             </Dropdown>
//           </TableControls>
//         </TableTop>

//         <TableMain>
//           <TableGrid minWidthClassName="min-w-[1200px]">
//             <TableHeader columnsClassName={columnsClassName}>
//               <TableCell className="justify-center">
//                 <TableCheckbox
//                   checked={isAllSelected}
//                   onToggle={toggleSelectAll}
//                 />
//               </TableCell>

//               {groupColumns.map((column) => (
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
//               {filteredGroups.length === 0 ? (
//                 <TableEmptyState text="No groups found" />
//               ) : (
//                 filteredGroups.map((group) => {
//                   const isSelected = selectedIds.includes(group.id);

//                   return (
//                     <div
//                       key={group.id}
//                       onClick={() => setOpenGroupModal(group)}
//                       className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-4 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
//                     >
//                       <TableCell
//                         className="justify-center"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <TableCheckbox
//                           checked={isSelected}
//                           onToggle={() => toggleRowSelection(group.id)}
//                         />
//                       </TableCell>

//                       <TableCell className="paragraph font-medium text-[var(--paragraph)]">
//                         {group.name}
//                       </TableCell>

//                       <TableCell className="paragraph">
//                         {group.members}
//                       </TableCell>

//                       <TableCell className="paragraph">
//                         {formatMoney(group.initialCredit)}
//                       </TableCell>

//                       <TableCell>
//                         <RestrictedBadge status={group.restricted} />
//                       </TableCell>

//                       <TableCell className="paragraph">
//                         {formatMoney(group.scheduleAmount)}
//                       </TableCell>

//                       <TableCell className="paragraph">
//                         {group.period}
//                       </TableCell>
//                     </div>
//                   );
//                 })
//               )}
//             </TableBody>
//           </TableGrid>
//         </TableMain>
//       </Table>

//       <GroupDetailsModal
//         open={Boolean(openGroupModal)}
//         onClose={() => setOpenGroupModal(null)}
//         group={openGroupModal}
//       />

//       <AddGroupModal
//         open={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />

//       <FilterGroupsModal
//         open={isFilterModalOpen}
//         onClose={() => setIsFilterModalOpen(false)}
//       />

//       <GroupActionModal
//         open={Boolean(actionModal)}
//         onClose={() => setActionModal(null)}
//         action={actionModal}
//         selectedCount={selectedIds.length}
//       />
//     </>
//   );
// };

// export default PrintingGroupsTable;

//============NEW==================
// PrintingGroupsTable.tsx
"use client";

import {
  GroupFilters,
  GroupItem,
  GroupRestrictedStatus,
  GroupSortKey,
  groupColumns,
  groupPeriodSortOrder,
  groupRestrictedSortOrder,
  initialGroupFilters,
  maxGroupQuota,
  printingGroupsData,
} from "@/lib/mock-data/Admin/groups";
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
} from "@/components/shared/table/Table";
import Button from "@/components/ui/button/Button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import { Lock, LockOpen, Plus, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import AddGroupModal from "./AddGroupModal";
import FilterGroupsModal from "./FilterGroupsModal";
import GroupActionModal, { type GroupActionValue } from "./GroupActionModal";
import GroupDetailsModal from "./GroupDetailsModal";

type SortDir = "asc" | "desc";
type InlineActionValue =
  | GroupActionValue
  | "restrict-selected"
  | "unrestrict-selected";

const columnsClassName =
  "[grid-template-columns:72px_minmax(220px,1.5fr)_minmax(130px,0.9fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(200px,1.2fr)_minmax(120px,0.8fr)]";

const formatMoney = (value: number) => value.toFixed(2);

function RestrictedBadge({ status }: { status: GroupRestrictedStatus }) {
  const isUnrestricted = status === "Unrestricted";

  return (
    <div
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
      style={{
        background: isUnrestricted
          ? "var(--color-success-100)"
          : "var(--color-danger-50)",
        color: isUnrestricted
          ? "var(--color-success-600)"
          : "var(--color-danger-600)",
      }}
    >
      {isUnrestricted ? (
        <LockOpen className="h-4 w-4" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
      <span>{status}</span>
    </div>
  );
}

const PrintingGroupsTable = () => {
  const [groups, setGroups] = useState<GroupItem[]>(printingGroupsData);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<GroupSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<GroupFilters>(initialGroupFilters);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    printingGroupsData
      .filter((item) => item.selectedByDefault)
      .map((item) => item.id)
  );

  const [openGroupModal, setOpenGroupModal] = useState<GroupItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<GroupActionValue | null>(null);

  const handleSort = (key: GroupSortKey) => {
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

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...groups]
      .filter((group) => {
        const matchesSearch =
          !term ||
          group.name.toLowerCase().includes(term) ||
          group.period.toLowerCase().includes(term) ||
          group.restricted.toLowerCase().includes(term);

        const matchesRestriction =
          filters.restriction === "All" ||
          group.restricted === filters.restriction;

        const matchesPeriod =
          filters.period === "All" || group.period === filters.period;

        const [minQuota, maxQuota] = filters.quotaRange;
        const matchesQuota =
          group.initialQuota >= minQuota && group.initialQuota <= maxQuota;

        return (
          matchesSearch && matchesRestriction && matchesPeriod && matchesQuota
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: GroupItem) => {
          switch (sortKey) {
            case "name":
              return item.name.toLowerCase();
            case "members":
              return item.members;
            case "initialQuota":
              return item.initialQuota;
            case "restricted":
              return groupRestrictedSortOrder[item.restricted];
            case "scheduleAmount":
              return item.scheduleAmount;
            case "period":
              return groupPeriodSortOrder[item.period];
            default:
              return item.name.toLowerCase();
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
  }, [groups, search, sortKey, sortDir, filters]);

  const selectedGroups = useMemo(
    () => groups.filter((group) => selectedIds.includes(group.id)),
    [groups, selectedIds]
  );

  const allVisibleIds = filteredGroups.map((group) => group.id);
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

  const handleCreateGroup = (newGroup: GroupItem) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  const handleSaveGroup = (updatedGroup: GroupItem) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group))
    );

    setOpenGroupModal(updatedGroup);
  };

  const handleInlineAction = (value: InlineActionValue) => {
    if (value === "restrict-selected") {
      setGroups((prev) =>
        prev.map((group) =>
          selectedIds.includes(group.id)
            ? { ...group, restricted: "Restricted" }
            : group
        )
      );
      return;
    }

    if (value === "unrestrict-selected") {
      setGroups((prev) =>
        prev.map((group) =>
          selectedIds.includes(group.id)
            ? { ...group, restricted: "Unrestricted" }
            : group
        )
      );
      return;
    }

    setActionModal(value);
  };

  const handleDeleteGroups = (ids: string[]) => {
    setGroups((prev) => prev.filter((group) => !ids.includes(group.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));

    if (openGroupModal && ids.includes(openGroupModal.id)) {
      setOpenGroupModal(null);
    }

    setActionModal(null);
  };

  const handleAssignQuota = (ids: string[], quota: number, note: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        ids.includes(group.id)
          ? {
              ...group,
              initialQuota: quota,
              notes: note || group.notes,
            }
          : group
      )
    );
    setSelectedIds(ids);
    setActionModal(null);
  };

  const handleExportGroups = (
    ids: string[],
    format: "PDF" | "CSV" | "Excel"
  ) => {
    const rows = groups.filter((group) => ids.includes(group.id));
    setSelectedIds(ids);

    if (rows.length === 0) {
      setActionModal(null);
      return;
    }

    if (format === "CSV") {
      const csv = [
        [
          "Group Name",
          "Members",
          "Initial Quota",
          "Restricted",
          "Scheduled Quota",
          "Period",
        ].join(","),
        ...rows.map((group) =>
          [
            group.name,
            group.members,
            group.initialQuota,
            group.restricted,
            group.scheduleAmount,
            group.period,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "printing-groups.csv";
      link.click();
      URL.revokeObjectURL(url);
    }

    if (format === "Excel") {
      const tsv = [
        [
          "Group Name",
          "Members",
          "Initial Quota",
          "Restricted",
          "Scheduled Quota",
          "Period",
        ].join("\t"),
        ...rows.map((group) =>
          [
            group.name,
            group.members,
            group.initialQuota,
            group.restricted,
            group.scheduleAmount,
            group.period,
          ].join("\t")
        ),
      ].join("\n");

      const blob = new Blob([tsv], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "printing-groups.xls";
      link.click();
      URL.revokeObjectURL(url);
    }

    if (format === "PDF") {
      const printableHtml = `
        <html>
          <head>
            <title>Printing Groups Export</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 32px; }
              h1 { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #d0d7e2; padding: 10px; text-align: left; }
              th { background: #f3f6fb; }
            </style>
          </head>
          <body>
            <h1>Printing Groups Export</h1>
            <table>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Members</th>
                  <th>Initial Quota</th>
                  <th>Restricted</th>
                  <th>Scheduled Quota</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (group) => `
                      <tr>
                        <td>${group.name}</td>
                        <td>${group.members}</td>
                        <td>${group.initialQuota}</td>
                        <td>${group.restricted}</td>
                        <td>${group.scheduleAmount}</td>
                        <td>${group.period}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printableHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }

    setActionModal(null);
  };

  return (
    <>
      <Table>
        <TableTop>
          <TableTitleBlock title="Printing Groups" />

          <TableControls>
            <TableSearch
              id="search-groups"
              label="Search groups"
              value={search}
              onChange={setSearch}
            />

            <Button
              variant="primary"
              iconLeft={<Plus className="h-5 w-5" />}
              className="h-14 px-6 text-base"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Group
            </Button>

            <Button
              variant="outline"
              iconLeft={<SlidersHorizontal className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filter
            </Button>

            <Dropdown
              onValueChange={(value) =>
                handleInlineAction(value as InlineActionValue)
              }
            >
              <DropdownTrigger className="h-14 min-w-[200px] px-6 text-base">
                Actions
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[300px]">
                <DropdownItem value="delete-selected" className="py-4 text-lg">
                  Delete selected
                </DropdownItem>
                <DropdownItem value="export-groups" className="py-4 text-lg">
                  Export groups
                </DropdownItem>
                <DropdownItem value="assign-quota" className="py-4 text-lg">
                  Assign quota
                </DropdownItem>
                <DropdownItem
                  value="restrict-selected"
                  className="py-4 text-lg"
                >
                  Restricted
                </DropdownItem>
                <DropdownItem
                  value="unrestrict-selected"
                  className="py-4 text-lg"
                >
                  Unrestricted
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </TableControls>
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[1200px]">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {groupColumns.map((column) => (
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
              {filteredGroups.length === 0 ? (
                <TableEmptyState text="No groups found" />
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = selectedIds.includes(group.id);

                  return (
                    <div
                      key={group.id}
                      onClick={() => setOpenGroupModal(group)}
                      className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-4 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell
                        className="justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(group.id)}
                        />
                      </TableCell>

                      <TableCell className="paragraph font-medium text-[var(--paragraph)]">
                        {group.name}
                      </TableCell>

                      <TableCell className="paragraph">
                        {group.members}
                      </TableCell>

                      <TableCell className="paragraph">
                        {formatMoney(group.initialQuota)}
                      </TableCell>

                      <TableCell>
                        <RestrictedBadge status={group.restricted} />
                      </TableCell>

                      <TableCell className="paragraph">
                        {formatMoney(group.scheduleAmount)}
                      </TableCell>

                      <TableCell className="paragraph">
                        {group.period}
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

      <GroupDetailsModal
        open={Boolean(openGroupModal)}
        onClose={() => setOpenGroupModal(null)}
        group={openGroupModal}
        onSave={handleSaveGroup}
      />

      <AddGroupModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateGroup}
        maxQuota={maxGroupQuota}
      />

      <FilterGroupsModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        value={filters}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setIsFilterModalOpen(false);
        }}
        onReset={() => setFilters(initialGroupFilters)}
        maxQuota={maxGroupQuota}
      />

      <GroupActionModal
        open={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        action={actionModal}
        selectedGroups={selectedGroups}
        onDelete={handleDeleteGroups}
        onExport={handleExportGroups}
        onAssignQuota={handleAssignQuota}
      />
    </>
  );
};

export default PrintingGroupsTable;
