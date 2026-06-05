export class WalletApi {
  static createTransaction(walletId, token, payload) {
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