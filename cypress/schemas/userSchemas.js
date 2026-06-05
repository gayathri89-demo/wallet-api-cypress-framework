export const userTokenResponseSchema = {
  type: "object",
  required: ["token", "refreshToken", "expiry", "userId"],
  properties: {
    token: { type: "string" },
    refreshToken: { type: "string" },
    expiry: { type: "string" },
    userId: { type: "string", format: "uuid" }
  },
  additionalProperties: true
};

export const userInfoSchema = {
  type: "object",
  required: ["walletId", "email"],
  properties: {
    walletId: { type: "string", format: "uuid" },
    name: { type: "string" },
    locale: { type: "string" },
    region: { type: "string" },
    timezone: { type: "string" },
    email: { type: "string" }
  },
  additionalProperties: true
};