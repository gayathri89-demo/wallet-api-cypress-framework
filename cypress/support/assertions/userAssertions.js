export class UserAssertions {
  static validateLoginResponse(response, schema) {
    expect(response.status).to.be.oneOf([200, 201]);

    cy.validateSchema(schema, response.body);

    expect(response.body.token).to.exist;
    expect(response.body.userId).to.exist;
  }

  static validateUserInfoResponse(response, schema) {
    expect(response.status).to.eq(200);

    cy.validateSchema(schema, response.body);

    expect(response.body.walletId).to.exist;
  }
}