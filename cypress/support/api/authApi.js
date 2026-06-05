export class AuthApi {
  static login(credentials) {
    if (Cypress.env("useMocks")) {
      return cy.fixture("mockResponses/walletApiMock").then((mock) => ({
        status: 200,
        body: mock.loginSuccess
      }));
    }

    return cy.request({
      method: "POST",
      url: `${Cypress.env("apiBaseUrl")}/user/login`,
      failOnStatusCode: false,
      headers: {
        "Content-Type": "application/json",
        "X-Service-Id": Cypress.env("serviceId")
      },
      body: credentials
    });
  }
}