export class WalletApi {
  static createTransaction(walletId, token, payload) {
    if (Cypress.env("useMocks")) {
      return cy.fixture("mockResponses/walletApiMock").then((mock) => {
        if (!token) {
          return {
            status: 401,
            body: mock.unauthorizedResponse
          };
        }

        if (!walletId || walletId === "invalid-wallet-id") {
          return {
            status: 404,
            body: mock.errorResponse
          };
        }

        if (
          !payload ||
          payload.amount === undefined ||
          payload.amount <= 0 ||
          !payload.currency ||
          payload.currency === "XYZ" ||
          !["credit", "debit"].includes(payload.type)
        ) {
          return {
            status: 422,
            body: mock.errorResponse
          };
        }

        if (payload.type === "debit" && payload.amount >= 999999) {
          return {
            status: 409,
            body: mock.insufficientBalanceResponse
          };
        }

        return {
          status: 201,
          body: {
            ...mock.transactionSuccess,
            currency: payload.currency,
            amount: payload.amount,
            type: payload.type
          }
        };
      });
    }

    return cy.request({
      method: "POST",
      url: `${Cypress.env("apiBaseUrl")}/wallet/${walletId}/transaction`,
      failOnStatusCode: false,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: payload
    });
  }
}