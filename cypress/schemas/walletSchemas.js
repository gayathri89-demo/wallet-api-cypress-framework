export const transactionSchema = {
  type: "object",
  required: ["transactionId", "status"],
  properties: {
    transactionId: { type: "string" },
    currency: { type: "string" },
    amount: { type: "number" },
    type: { type: "string", enum: ["credit", "debit"] },
    status: { type: "string" },
    outcome: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" }
  },
  additionalProperties: true
};