export const transactionSchema = {
  type: "object",
  required: ["transactionId", "status", "createdAt"],
  properties: {
    transactionId: { type: "string" },
    currency: { type: "string" },
    amount: { type: "number" },
    type: { type: "string", enum: ["credit", "debit"] },
    status: { type: "string", enum: ["pending", "finished"] },
    outcome: { type: "string", enum: ["approved", "denied"] },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  additionalProperties: true,
};

export const currencyClipSchema = {
  type: "object",
  required: ["currency", "balance", "lastTransaction", "transactionCount"],
  properties: {
    currency: { type: "string" },
    balance: { type: "number", minimum: 0 },
    lastTransaction: { type: "string" },
    transactionCount: { type: "number", minimum: 0 },
  },
  additionalProperties: false,
};

export const walletSchema = {
  type: "object",
  required: ["walletId", "currencyClips", "createdAt", "updatedAt"],
  properties: {
    walletId: { type: "string" },
    currencyClips: {
      type: "array",
      items: currencyClipSchema,
    },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  additionalProperties: false,
};

export const transactionHistorySchema = {
  type: "object",
  required: ["transactions"],
  properties: {
    transactions: {
      type: "array",
      items: transactionSchema,
    },
  },
  additionalProperties: true,
};