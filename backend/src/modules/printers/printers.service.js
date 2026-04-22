const Printer = require("../../models/Printer");
const { formatDateTimeLabel } = require("../../utils/formatters");

const getAdminPrintersData = async () => {
  const printers = await Printer.find().sort({ createdAt: -1 });

  return printers.map((printer) => ({
    id: printer._id.toString(),
    name: printer.name,
    model: printer.model,
    location: printer.location,
    building: printer.building,
    room: printer.room,
    department: printer.department,
    status: printer.status,
    capabilities: printer.capabilities,
    totalPagesPrinted: printer.totalPagesPrinted,
    totalJobsSubmitted: printer.totalJobsSubmitted,
    costPerPage: printer.costPerPage,
    ipAddress: printer.ipAddress,
    queueName: printer.queueName,
    serialNumber: printer.serialNumber,
    deviceType: printer.deviceType,
    tonerLevel: printer.tonerLevel,
    paperLevel: printer.paperLevel,
    lastUsed: printer.lastUsed
      ? formatDateTimeLabel(printer.lastUsed)
      : "No activity",
    notes: printer.notes || "",
  }));
};

module.exports = {
  getAdminPrintersData,
};
