const { User } = require("../models/User");
const Printer = require("../models/Printer");
const Queue = require("../models/Queue");
const PrintJob = require("../models/PrintJob");
const { formatDateTimeLabel } = require("../utils/formatters");

const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const mapped = await Promise.all(
      users.map(async (user) => {
        const stats = await PrintJob.aggregate([
          { $match: { userId: user._id } },
          {
            $group: {
              _id: "$userId",
              jobs: { $sum: 1 },
              pages: { $sum: "$pages" },
            },
          },
        ]);

        return {
          id: user._id.toString(),
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department || "Software Engineering",
          standing: user.standing || "Student",
          phone: user.phone || "-",
          quota: user.printing?.quota?.remaining ?? 0,
          restricted: user.restricted ? "Restricted" : "Unrestricted",
          pages: stats[0]?.pages || 0,
          jobs: stats[0]?.jobs || 0,
          lastActivity: user.lastActivity ? formatDateTimeLabel(user.lastActivity) : "No activity",
          notes: "",
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        users: mapped,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminPrinters = async (req, res, next) => {
  try {
    const printers = await Printer.find().sort({ createdAt: -1 });

    const mapped = printers.map((printer) => ({
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
      lastUsed: printer.lastUsed ? formatDateTimeLabel(printer.lastUsed) : "No activity",
      notes: printer.notes || "",
    }));

    return res.status(200).json({
      success: true,
      data: {
        printers: mapped,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminQueues = async (req, res, next) => {
  try {
    const queues = await Queue.find().sort({ createdAt: -1 });

    const mapped = queues.map((queue) => ({
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

    return res.status(200).json({
      success: true,
      data: {
        queues: mapped,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminUsers,
  getAdminPrinters,
  getAdminQueues,
};
