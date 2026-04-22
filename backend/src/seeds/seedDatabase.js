const env = require("../config/env");
const { connectDatabase } = require("../config/db");
const { User } = require("../models/User");
const Printer = require("../models/Printer");
const Queue = require("../models/Queue");
const QuotaTransaction = require("../models/QuotaTransaction");
const PrintJob = require("../models/PrintJob");
const {
  usersSeed,
  printersSeed,
  queuesSeed,
  quotaTransactionsSeed,
  printJobsSeed,
} = require("./seedData");

const resetCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Printer.deleteMany({}),
    Queue.deleteMany({}),
    QuotaTransaction.deleteMany({}),
    PrintJob.deleteMany({}),
  ]);
};

const seedUsers = async () => {
  const createdUsers = [];

  for (const userData of usersSeed) {
    const user = new User({
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      phone: userData.phone,
      restricted: userData.restricted,
      standing: userData.standing,
      printing: userData.printing,
    });

    await user.setPassword(userData.password);
    await user.save();
    createdUsers.push(user);
  }

  return createdUsers;
};

const seedPrinters = async () => {
  return Printer.insertMany(printersSeed);
};

const seedQueues = async () => {
  return Queue.insertMany(queuesSeed);
};

const seedQuotaTransactions = async (usersMap) => {
  const data = quotaTransactionsSeed.map((item) => ({
    userId: usersMap.get(item.userUsername)._id,
    type: item.type,
    amount: item.amount,
    quotaAfter: item.quotaAfter,
    comment: item.comment,
    reference: item.reference,
    method: item.method,
  }));

  return QuotaTransaction.insertMany(data);
};

const seedPrintJobs = async (usersMap, printersMap, queuesMap) => {
  const now = Date.now();

  const data = printJobsSeed.map((item, index) => {
    const submittedAt = new Date(now - (index + 1) * 10 * 60 * 1000);
    const printedAt =
      item.status === "Printed" || item.status === "Refunded" || item.status === "Failed"
        ? new Date(submittedAt.getTime() + 5 * 60 * 1000)
        : null;

    return {
      userId: usersMap.get(item.userUsername)._id,
      printerId: printersMap.get(item.printerName)?._id || null,
      queueId: queuesMap.get(item.queueName)?._id || null,
      jobId: item.jobId,
      documentName: item.documentName,
      pages: item.pages,
      cost: item.cost,
      status: item.status,
      attributes: item.attributes,
      options: item.attributes,
      clientSource: item.clientSource,
      fileType: item.fileType,
      printMode: item.printMode,
      readinessPercent: item.readinessPercent,
      submittedAt,
      printedAt,
    };
  });

  return PrintJob.insertMany(data);
};

const buildMap = (items, keySelector) => {
  const map = new Map();
  for (const item of items) {
    map.set(keySelector(item), item);
  }
  return map;
};

const runSeed = async () => {
  try {
    await connectDatabase();
    console.log(`Connected to MongoDB "${env.mongoDbName}" for seeding.`);

    await resetCollections();
    console.log("Cleared collections.");

    const users = await seedUsers();
    const printers = await seedPrinters();
    const queues = await seedQueues();

    const usersMap = buildMap(users, (item) => item.username);
    const printersMap = buildMap(printers, (item) => item.name);
    const queuesMap = buildMap(queues, (item) => item.name);

    const transactions = await seedQuotaTransactions(usersMap);
    const jobs = await seedPrintJobs(usersMap, printersMap, queuesMap);

    console.log("Seed completed successfully.");
    console.log(`Users: ${users.length}`);
    console.log(`Printers: ${printers.length}`);
    console.log(`Queues: ${queues.length}`);
    console.log(`Quota Transactions: ${transactions.length}`);
    console.log(`Print Jobs: ${jobs.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

runSeed();
