export class TransactionAssertions {
  static validateSuccess(response, expectedTransaction, schema) {
    expect(response.status).to.be.oneOf([200, 201, 202]);

    cy.validateSchema(schema, response.body);

    expect(response.body.transactionId).to.exist;
    expect(response.body.currency).to.eq(expectedTransaction.currency);
    expect(response.body.amount).to.eq(expectedTransaction.amount);
    expect(response.body.type).to.eq(expectedTransaction.type);
  }

  static validateValidationError(response) {
    expect(response.status).to.be.oneOf([400, 422]);
    expect(response.body).to.exist;
  }

  static validateUnauthorized(response) {
    expect(response.status).to.eq(401);
    expect(response.body).to.exist;
  }

  static validateInsufficientBalance(response) {
    expect(response.status).to.be.oneOf([400, 409, 422]);
    expect(response.body).to.exist;
  }

  static validateTransactionResponse(response, expectedPayload) {
    expect(response.status).to.be.oneOf([200, 201, 202]);

    expect(response.body.transactionId).to.exist;
    expect(response.body.status).to.be.oneOf(["pending", "finished"]);
    expect(response.body.createdAt).to.exist;

    if (response.body.status === "pending") {
      return;
    }

    expect(response.body.outcome).to.be.oneOf(["approved", "denied"]);
    expect(response.body.currency).to.eq(expectedPayload.currency);
    expect(response.body.amount).to.eq(expectedPayload.amount);
    expect(response.body.type).to.eq(expectedPayload.type);
    expect(response.body.updatedAt).to.exist;
  }

}