const { createHttpError } = require("../../utils/http");

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const toNumberValue = (value, defaultValue = NaN) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : defaultValue;
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );
};

const normalizeCreateJobPayload = (payload = {}) => {
  const queueId = toStringValue(payload.queueId);
  const pages = toNumberValue(payload.pages);
  const copies = toNumberValue(payload.copies, 1);

  if (!queueId) {
    throw createHttpError(400, "queueId is required.");
  }

  if (!Number.isFinite(pages) || pages < 1) {
    throw createHttpError(400, "pages must be at least 1.");
  }

  if (!Number.isFinite(copies) || copies < 1) {
    throw createHttpError(400, "copies must be at least 1.");
  }

  return {
    queueId,
    printerId: toStringValue(payload.printerId),
    documentName:
      toStringValue(payload.documentName) ||
      toStringValue(payload.originalFileName) ||
      toStringValue(payload.fileName) ||
      "Untitled document",
    fileName: toStringValue(payload.fileName),
    originalFileName: toStringValue(payload.originalFileName),
    fileType: toStringValue(payload.fileType || "pdf").toLowerCase(),
    fileSize: Math.max(0, toNumberValue(payload.fileSize, 0)),
    pages,
    copies,
    colorMode: toStringValue(payload.colorMode || payload.color || "B&W"),
    mode: /duplex/i.test(toStringValue(payload.mode || payload.duplex))
      ? "Duplex"
      : "Simplex",
    paperSize: toStringValue(payload.paperSize),
    quality: toStringValue(payload.quality),
    attributes: toStringArray(payload.attributes),
    options: toStringArray(payload.options),
    clientType: toStringValue(payload.clientType || "Web Upload"),
    notes: toStringValue(payload.notes),
  };
};

const normalizeJobIdsPayload = (payload = {}) => {
  const jobIds = toStringArray(payload.jobIds || payload.ids);

  if (jobIds.length === 0) {
    throw createHttpError(400, "At least one job id is required.");
  }

  return {
    jobIds,
  };
};

module.exports = {
  normalizeCreateJobPayload,
  normalizeJobIdsPayload,
};
