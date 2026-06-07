import { HTTP_STATUS } from "../constants/httpStatus";

export class TransactionAssertions {
  static validateSuccess(response, expectedTransaction, schema) {
    expect(response.status).to.be.oneOf([
      HTTP_STATUS.OK,
      HTTP_STATUS.CREATED,
      HTTP_STATUS.ACCEPTED,
    ]);

    cy.validateSchema(schema, response.body);

    expect(response.body.transactionId).to.exist;
    expect(response.body.status).to.be.oneOf(["pending", "finished"]);
    expect(response.body.createdAt).to.exist;

    if (response.body.status === "pending") {
      return;
    }

    expect(response.body.currency).to.eq(expectedTransaction.currency);
    expect(response.body.amount).to.eq(expectedTransaction.amount);
    expect(response.body.type).to.eq(expectedTransaction.type);
    expect(response.body.outcome).to.be.oneOf(["approved", "denied"]);
    expect(response.body.updatedAt).to.exist;
  }

  static validateValidationError(response) {
    expect(response.status).to.be.oneOf([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ]);
    expect(response.body).to.exist;
  }

  static validateUnauthorized(response) {
    expect(response.status).to.eq(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).to.exist;
  }

  static validateInsufficientBalance(response) {
    expect(response.status).to.be.oneOf([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.CONFLICT,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ]);
    expect(response.body).to.exist;
  }

  static validateTransactionResponse(response, expectedPayload) {
    expect(response.status).to.be.oneOf([
      HTTP_STATUS.OK,
      HTTP_STATUS.CREATED,
      HTTP_STATUS.ACCEPTED,
    ]);

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

  static validateOkResponse(response) {
    expect(response.status).to.eq(HTTP_STATUS.OK);
    expect(response.body).to.exist;
  }
}