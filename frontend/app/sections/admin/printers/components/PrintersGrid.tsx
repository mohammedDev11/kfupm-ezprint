"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
//import MainButton from "@/app/Mohammed/components/MainButton";
import SegmentToggle from "@/components/shared/actions/SegmentToggle";
import {
  Table,
  TableControls,
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
import {
  printerFilterOptions,
  type PrinterFilterValue,
  type PrinterItem,
} from "@/lib/mock-data/Admin/printers";
import { apiGet } from "@/services/api";
import PrinterDetailsModal from "./AddPrinterModal";
import PrinterCard from "./PrinterCard";
import AddPrinterModal from "./PrinterDetailsModal";

const PrintersGrid = () => {
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState<"2" | "3">("2");
  const [filter, setFilter] = useState<PrinterFilterValue>("all");
  const [loadError, setLoadError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterItem | null>(
    null,
  );

  useEffect(() => {
    apiGet<{ printers: PrinterItem[] }>("/admin/printers", "admin")
      .then((data) => {
        setPrinters(Array.isArray(data?.printers) ? data.printers : []);
        setLoadError("");
      })
      .catch((requestError) => {
        setPrinters([]);
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load printers.",
        );
      });
  }, []);

  const filteredPrinters = useMemo(() => {
    const term = search.trim().toLowerCase();

    return printers.filter((printer) => {
      const haystack = [
        printer.name,
        printer.model,
        printer.location,
        printer.building,
        printer.room,
        printer.department,
        printer.status,
        printer.queueName,
        printer.ipAddress,
        printer.serialNumber,
        printer.deviceType,
        printer.notes,
        printer.lastUsed,
        ...printer.capabilities,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || haystack.includes(term);

      const matchesFilter =
        filter === "all" ||
        (filter === "online" && printer.status === "Online") ||
        (filter === "offline" && printer.status === "Offline") ||
        (filter === "low-toner" && printer.status === "Low Toner") ||
        (filter === "paper-jam" && printer.status === "Paper Jam") ||
        (filter === "color" && printer.capabilities.includes("Color")) ||
        (filter === "bw" && printer.capabilities.includes("B&W")) ||
        (filter === "duplex" && printer.capabilities.includes("Duplex")) ||
        (filter === "secure-release" &&
          printer.capabilities.includes("Secure Release"));

      return matchesSearch && matchesFilter;
    });
  }, [printers, search, filter]);

  const gridClassName =
    columns === "2"
      ? "grid grid-cols-1 gap-6 xl:grid-cols-2"
      : "grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3";

  return (
    <>
      <Table>
        <TableTop>
          <TableTitleBlock
            title="Printers"
            description={`${filteredPrinters.length} printers`}
          />

          <TableControls>
            <SegmentToggle
              value={columns}
              onChange={(value) => setColumns(value as "2" | "3")}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
              ]}
            />

            <TableSearch
              value={search}
              onChange={setSearch}
              label="Search printers..."
              id="printers-search"
              wrapperClassName="w-full md:w-[320px]"
            />

            <Dropdown
              value={filter}
              onValueChange={(value) => setFilter(value as PrinterFilterValue)}
            >
              <DropdownTrigger className="h-14 min-w-[190px] rounded-2xl px-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>
                    {printerFilterOptions.find((item) => item.value === filter)
                      ?.label ?? "Filter"}
                  </span>
                </div>
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-[220px]">
                {printerFilterOptions.map((item) => (
                  <DropdownItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            {/*<MainButton
              label="Add Printer"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => setAddOpen(true)}
            />*/}
            <Button
              variant="primary"
              iconLeft={<Plus className="h-5 w-5" />}
              className="rounded-2xl px-6 py-3"
              onClick={() => setAddOpen(true)}
            >
              Add Printer
            </Button>
          </TableControls>
        </TableTop>

        {loadError ? (
          <div className="px-6 pb-2">
            <p
              className="rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "rgba(239, 68, 68, 0.2)",
                background: "rgba(254, 242, 242, 1)",
                color: "rgb(185, 28, 28)",
              }}
            >
              {loadError}
            </p>
          </div>
        ) : null}

        <div className="p-6">
          {filteredPrinters.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              No printers found.
            </div>
          ) : (
            <div className={gridClassName}>
              {filteredPrinters.map((printer) => (
                <PrinterCard
                  key={printer.id}
                  printer={printer}
                  columns={columns === "2" ? 2 : 3}
                  onClick={() => setSelectedPrinter(printer)}
                  onConfigure={(item) => {
                    console.log("Configure printer:", item);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Table>

      <AddPrinterModal open={addOpen} onClose={() => setAddOpen(false)} />

      <PrinterDetailsModal
        open={Boolean(selectedPrinter)}
        onClose={() => setSelectedPrinter(null)}
        printer={selectedPrinter}
      />
    </>
  );
};

export default PrintersGrid;
