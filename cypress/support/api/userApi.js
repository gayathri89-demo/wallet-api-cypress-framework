export class UserApi {
  static getUserInfo(userId, token) {
    if (Cypress.env("useMocks")) {
      return cy.fixture("mockResponses/walletApiMock").then((mock) => ({
        status: 200,
        body: mock.userInfo
      }));
    }

    return cy.request({
      method: "GET",
      url: `${Cypress.env("apiBaseUrl")}/user/info/${userId}`,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}