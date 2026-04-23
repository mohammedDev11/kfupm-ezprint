const crypto = require("crypto");
const fs = require("fs/promises");
const net = require("net");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const env = require("../../config/env");
const { createHttpError } = require("../../utils/http");

const execFileAsync = promisify(execFile);
const SUPPORTED_MIME_TYPES = new Set(["application/pdf"]);

const sanitizeFileName = (value = "") =>
  value
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const getSha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

const countPdfPages = (buffer) => {
  try {
    const text = buffer.toString("latin1");
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return matches?.length || 1;
  } catch {
    return 1;
  }
};

const resolveFileExtension = (fileName = "", contentType = "") => {
  const extension = path.extname(fileName).toLowerCase();

  if (extension) {
    return extension;
  }

  if (contentType === "application/pdf") {
    return ".pdf";
  }

  return "";
};

const assertSupportedPrintFile = ({ fileName, contentType }) => {
  const extension = resolveFileExtension(fileName, contentType);

  if (SUPPORTED_MIME_TYPES.has(contentType) || extension === ".pdf") {
    return {
      normalizedContentType: "application/pdf",
      extension: ".pdf",
    };
  }

  throw createHttpError(
    415,
    "Only PDF files are supported for the real print demo right now.",
  );
};

const storePrintFile = async ({ jobId, originalFileName, contentType, buffer }) => {
  const { normalizedContentType, extension } = assertSupportedPrintFile({
    fileName: originalFileName,
    contentType,
  });
  const storageRoot = path.resolve(process.cwd(), env.printStorageDir);
  const safeBaseName = sanitizeFileName(path.basename(originalFileName, extension)) || jobId;
  const storedFileName = `${jobId}-${safeBaseName}${extension}`;
  const absolutePath = path.join(storageRoot, storedFileName);

  await fs.mkdir(storageRoot, { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return {
    contentType: normalizedContentType,
    absolutePath,
    relativePath: path.relative(process.cwd(), absolutePath),
    storedFileName,
    fileSize: buffer.length,
    pageCount: countPdfPages(buffer),
    checksumSha256: getSha256(buffer),
  };
};

const dispatchViaSocket = async ({ host, port, buffer, destinationName }) => {
  if (!host) {
    throw createHttpError(500, "Printer IP is not configured for socket printing.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const startedAt = Date.now();
    const socket = net.createConnection({ host, port }, () => {
      socket.write(buffer);
      socket.end();
    });

    const fail = (error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(error);
    };

    socket.setTimeout(env.printTimeoutMs, () => {
      fail(createHttpError(504, `Timed out sending job to ${destinationName || host}.`));
    });

    socket.on("error", (error) => {
      fail(createHttpError(502, error.message || "Printer connection failed."));
    });

    socket.on("close", (hadError) => {
      if (settled || hadError) {
        return;
      }

      settled = true;
      resolve({
        method: "socket",
        targetHost: host,
        targetPort: port,
        destinationName: destinationName || host,
        bytesSent: buffer.length,
        jobReference: "",
        durationMs: Date.now() - startedAt,
      });
    });
  });
};

const dispatchViaLp = async ({ filePath, destinationName }) => {
  if (!env.printDestination && !destinationName) {
    throw createHttpError(500, "PRINT_DESTINATION is required for lp transport.");
  }

  const destination = env.printDestination || destinationName;
  const commandArgs = env.printLpRaw
    ? ["-o", "raw", "-d", destination, filePath]
    : ["-d", destination, filePath];
  const { stdout } = await execFileAsync("lp", commandArgs);

  return {
    method: "lp",
    targetHost: "",
    targetPort: 0,
    destinationName: destination,
    bytesSent: 0,
    jobReference: stdout.trim(),
    durationMs: 0,
  };
};

const dispatchPrintFile = async ({ printer, filePath, buffer }) => {
  if (env.printTransport === "lp") {
    return dispatchViaLp({
      filePath,
      destinationName: printer?.name || env.printDestination,
    });
  }

  const fileBuffer =
    buffer && Buffer.isBuffer(buffer) ? buffer : await fs.readFile(filePath);

  return dispatchViaSocket({
    host: printer?.network?.ipAddress || env.printDefaultPrinterIp,
    port: env.printSocketPort,
    buffer: fileBuffer,
    destinationName: printer?.name || env.printDefaultPrinterName,
  });
};

module.exports = {
  storePrintFile,
  dispatchPrintFile,
  countPdfPages,
};
