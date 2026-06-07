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