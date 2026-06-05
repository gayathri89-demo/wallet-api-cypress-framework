export const userTokenResponseSchema = {
  type: "object",
  required: ["token", "userId"],
  properties: {
    token: {
      type: "string"
    },
    userId: {
      type: "string"
    }
  },
  additionalProperties: true
};

export const userInfoSchema = {
  type: "object",
  required: ["walletId"],
  properties: {
    walletId: {
      type: "string"
    }
  },
  additionalProperties: true
};