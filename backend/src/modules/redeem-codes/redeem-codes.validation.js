const { createHttpError } = require("../../utils/http");

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const toNumberValue = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : NaN;
};

const normalizeGeneratePayload = (payload = {}) => {
  const quotaAmount = toNumberValue(payload.quotaAmount || payload.amount);
  const count = Math.floor(toNumberValue(payload.count || payload.numberOfCodes || 1));
  const expiresAt = toStringValue(payload.expiresAt || payload.expiryDate);

  if (!Number.isFinite(quotaAmount) || quotaAmount <= 0) {
    throw createHttpError(400, "Quota amount must be greater than zero.");
  }

  if (!Number.isFinite(count) || count < 1 || count > 250) {
    throw createHttpError(400, "Number of codes must be between 1 and 250.");
  }

  return {
    quotaAmount: Number(quotaAmount.toFixed(2)),
    count,
    expiresAt,
    note: toStringValue(payload.note),
    targetUserId: toStringValue(payload.targetUserId || payload.targetUser),
    targetGroupId: toStringValue(payload.targetGroupId || payload.targetGroup),
  };
};

const normalizeBulkPayload = (payload = {}) => {
  const ids = Array.isArray(payload.ids)
    ? payload.ids.map(toStringValue).filter(Boolean)
    : [];

  if (ids.length === 0) {
    throw createHttpError(400, "At least one redeem code id is required.");
  }

  return { ids };
};

module.exports = {
  normalizeBulkPayload,
  normalizeGeneratePayload,
};
