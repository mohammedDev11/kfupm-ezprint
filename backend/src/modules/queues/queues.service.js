const Queue = require("../../models/Queue");

const getAdminQueuesData = async () => {
  const queues = await Queue.find().sort({ createdAt: -1 });

  return queues.map((queue) => ({
    id: queue._id.toString(),
    name: queue.name,
    description: queue.description,
    type: queue.type,
    status: queue.status,
    assignedPrinters: queue.assignedPrinters,
    defaultPrinter: queue.defaultPrinter,
    allowedRoles: queue.allowedRoles,
    allowedGroups: queue.allowedGroups,
    allowedDepartments: queue.allowedDepartments,
    restrictedUsers: queue.restrictedUsers,
    pendingJobs: queue.pendingJobs,
    retentionHours: queue.retentionHours,
    secureRelease: queue.secureRelease,
    manualReleaseRequired: queue.manualReleaseRequired,
    allowReleaseAllJobs: queue.allowReleaseAllJobs,
    requirePrinterAuthentication: queue.requirePrinterAuthentication,
    autoDeleteExpiredJobs: queue.autoDeleteExpiredJobs,
  }));
};

module.exports = {
  getAdminQueuesData,
};
