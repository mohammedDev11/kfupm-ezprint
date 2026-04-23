const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  mongoDbName: process.env.MONGO_DB_NAME || "alpha_queue",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "change-this-secret-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  printUploadLimit: process.env.PRINT_UPLOAD_LIMIT || "25mb",
  printTransport: process.env.PRINT_TRANSPORT || "socket",
  printSocketPort: Number(process.env.PRINT_SOCKET_PORT) || 9100,
  printTimeoutMs: Number(process.env.PRINT_TIMEOUT_MS) || 15000,
  printStorageDir: process.env.PRINT_STORAGE_DIR || "storage/print-jobs",
  printLpRaw: process.env.PRINT_LP_RAW === "true",
  printDefaultPrinterIp: process.env.PRINT_DEFAULT_PRINTER_IP || "",
  printDefaultPrinterName: process.env.PRINT_DEFAULT_PRINTER_NAME || "HP MFP M830",
  printDefaultPrinterModel: process.env.PRINT_DEFAULT_PRINTER_MODEL || "HP MFP M830",
  printDefaultPrinterBuilding: process.env.PRINT_DEFAULT_PRINTER_BUILDING || "22",
  printDefaultPrinterRoom: process.env.PRINT_DEFAULT_PRINTER_ROOM || "339",
  printDefaultPrinterDepartment:
    process.env.PRINT_DEFAULT_PRINTER_DEPARTMENT || "CCM",
  printDefaultPrinterLocationCode:
    process.env.PRINT_DEFAULT_PRINTER_LOCATION_CODE || "22/339",
  printDefaultQueueName:
    process.env.PRINT_DEFAULT_QUEUE_NAME || "HP MFP M830 Secure Release Queue",
  printDefaultCostPerPage:
    Number(process.env.PRINT_DEFAULT_COST_PER_PAGE) || 0.05,
  printDefaultUsername: process.env.PRINT_DEFAULT_USERNAME || "",
  printDefaultPassword: process.env.PRINT_DEFAULT_PASSWORD || "",
  printDestination: process.env.PRINT_DESTINATION || "",
};

module.exports = env;
