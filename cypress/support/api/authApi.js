export class AuthApi {
  static login(credentials) {
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