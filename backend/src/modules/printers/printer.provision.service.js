const Printer = require("../../models/Printer");
const Queue = require("../../models/Queue");
const env = require("../../config/env");

const toIdString = (value) => value?.toString?.() || "";

const getDefaultPrinterIdentity = () => ({
  ipAddress: env.printDefaultPrinterIp.trim(),
  name: env.printDefaultPrinterName.trim(),
});

const findExistingDefaultPrinter = async ({ ipAddress, name }) => {
  if (ipAddress) {
    const printerByIp = await Printer.findOne({ "network.ipAddress": ipAddress });
    if (printerByIp) {
      return printerByIp;
    }
  }

  if (name) {
    return Printer.findOne({ name });
  }

  return null;
};

const ensureDefaultPrinterSetup = async () => {
  const identity = getDefaultPrinterIdentity();

  if (!identity.ipAddress) {
    return {
      printer: null,
      queue: null,
    };
  }

  let printer = await findExistingDefaultPrinter(identity);

  if (!printer) {
    printer = new Printer();
  }

  printer.name = identity.name || env.printDefaultPrinterName;
  printer.model = env.printDefaultPrinterModel;
  printer.department = env.printDefaultPrinterDepartment;
  printer.location = {
    ...printer.location,
    building: env.printDefaultPrinterBuilding,
    room: env.printDefaultPrinterRoom,
    floor: printer.location?.floor ?? null,
    coordinates: {
      lat: printer.location?.coordinates?.lat ?? null,
      lng: printer.location?.coordinates?.lng ?? null,
    },
  };
  printer.status = {
    ...printer.status,
    current: "Online",
    lastCheckedAt: new Date(),
    toner: {
      level: printer.status?.toner?.level ?? 100,
      lowThreshold: printer.status?.toner?.lowThreshold ?? 20,
      alertSent: printer.status?.toner?.alertSent ?? false,
    },
    paper: {
      level: printer.status?.paper?.level ?? 100,
      lowThreshold: printer.status?.paper?.lowThreshold ?? 30,
      alertSent: printer.status?.paper?.alertSent ?? false,
    },
    errorDetails: "",
    uptime: printer.status?.uptime ?? 0,
  };
  printer.capabilities = {
    ...printer.capabilities,
    supported: Array.from(
      new Set([
        ...(printer.capabilities?.supported || []),
        "B&W",
        "Duplex",
        "Secure Release",
        "PDF",
      ]),
    ),
    defaultSettings: {
      colorMode: printer.capabilities?.defaultSettings?.colorMode || "B&W",
      printMode: printer.capabilities?.defaultSettings?.printMode || "Simplex",
      paperSize: printer.capabilities?.defaultSettings?.paperSize || "A4",
      quality: printer.capabilities?.defaultSettings?.quality || "Normal",
    },
  };
  printer.costPerPage = env.printDefaultCostPerPage;
  printer.network = {
    ...printer.network,
    ipAddress: identity.ipAddress,
  };
  printer.notes = `Provisioned for secure-release web printing at ${env.printDefaultPrinterLocationCode}.`;
  printer.isActive = true;

  await printer.save();

  let queue = await Queue.findOne({ name: env.printDefaultQueueName });

  if (!queue) {
    queue = new Queue();
  }

  queue.name = env.printDefaultQueueName;
  queue.description = `Secure-release queue for ${env.printDefaultPrinterName}.`;
  queue.type = "Secure Release Queue";
  queue.status = {
    ...queue.status,
    current: "Active",
    pausedAt: null,
    pauseReason: "",
  };
  queue.printers = {
    ...queue.printers,
    assigned: [printer._id],
    default: printer._id,
    totalAssigned: 1,
    onlineCount: printer.status?.current === "Online" ? 1 : 0,
  };
  queue.access = {
    ...queue.access,
    allowedRoles: ["User", "SubAdmin", "Admin"],
    allowedGroups: queue.access?.allowedGroups || [],
    allowedDepartments: queue.access?.allowedDepartments || [],
    restrictedUsers: queue.access?.restrictedUsers || [],
    requiresApproval: false,
    approverIds: [],
  };
  queue.security = {
    ...queue.security,
    secureRelease: true,
    manualReleaseRequired: true,
    allowReleaseAllJobs: true,
    requirePrinterAuthentication: false,
    releaseMethod: "PIN",
  };
  queue.jobManagement = {
    ...queue.jobManagement,
    retentionHours: queue.jobManagement?.retentionHours || 24,
    autoDeleteExpired: true,
    maxConcurrentJobs: queue.jobManagement?.maxConcurrentJobs || 0,
    jobQueueTimeout: queue.jobManagement?.jobQueueTimeout || 0,
  };
  queue.notifications = {
    ...queue.notifications,
    enabled: false,
  };
  queue.isActive = true;

  await queue.save();

  if (toIdString(printer.queue?.assignedQueueId) !== toIdString(queue._id)) {
    printer.queue = {
      ...printer.queue,
      assignedQueueId: queue._id,
      queueName: queue.name,
      enabled: true,
      manualReleaseRequired: true,
      pinRequired: false,
    };
    await printer.save();
  }

  return {
    printer,
    queue,
  };
};

module.exports = {
  ensureDefaultPrinterSetup,
};
