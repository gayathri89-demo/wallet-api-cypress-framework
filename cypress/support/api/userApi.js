export class UserApi {
  static getUserInfo(userId, token) {
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