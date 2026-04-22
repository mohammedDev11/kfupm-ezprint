const Printer = require("../../models/Printer");
const { formatDateTimeLabel } = require("../../utils/formatters");

const formatPrinterLocation = (printer) => {
  const building = printer.location?.building || "";
  const room = printer.location?.room ? `Room ${printer.location.room}` : "";
  return [building, room].filter(Boolean).join(", ");
};

const getAdminPrintersData = async () => {
  const printers = await Printer.find().sort({ createdAt: -1 });

  return printers.map((printer) => ({
    id: printer._id.toString(),
    name: printer.name,
    model: printer.model,
    location: formatPrinterLocation(printer),
    building: printer.location?.building || "",
    room: printer.location?.room || "",
    department: printer.department,
    status: printer.status?.current || "Online",
    capabilities: printer.capabilities?.supported || [],
    totalPagesPrinted: printer.statistics?.totalPagesPrinted || 0,
    totalJobsSubmitted: printer.statistics?.totalJobsSubmitted || 0,
    costPerPage: printer.costPerPage,
    ipAddress: printer.network?.ipAddress || "",
    queueName: printer.queue?.queueName || "",
    serialNumber: printer.serialNumber,
    deviceType: printer.device?.type || "Physical",
    tonerLevel: printer.status?.toner?.level ?? 0,
    paperLevel: printer.status?.paper?.level ?? 0,
    lastUsed: printer.statistics?.lastUsedAt
      ? formatDateTimeLabel(printer.statistics.lastUsedAt)
      : "No activity",
    notes: printer.notes || "",
  }));
};

module.exports = {
  getAdminPrintersData,
};
