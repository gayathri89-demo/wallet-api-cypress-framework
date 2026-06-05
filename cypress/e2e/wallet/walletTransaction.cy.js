import { AuthApi } from "../../support/api/authApi";
import { UserApi } from "../../support/api/userApi";
import { WalletApi } from "../../support/api/walletApi";
import { transactionSchema } from "../../schemas/walletSchemas";

describe("Wallet Transaction API - POST /wallet/{walletId}/transaction", () => {
  let token;
  let walletId;

  before(() => {
    const credentials = {
      username: Cypress.env("username"),
      password: Cypress.env("password")
    };

    AuthApi.login(credentials)
      .then((loginResponse) => {
        expect(loginResponse.status).to.be.oneOf([200, 201]);
        expect(loginResponse.body.token).to.exist;
        expect(loginResponse.body.userId).to.exist;

        token = loginResponse.body.token;

        return UserApi.getUserInfo(loginResponse.body.userId, token);
      })
      .then((userResponse) => {
        expect(userResponse.status).to.eq(200);
        expect(userResponse.body.walletId).to.exist;

        walletId = userResponse.body.walletId;
      });
  });

  it("[positive] should create a valid credit transaction", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.creditEUR).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        cy.validateSchema(transactionSchema, response.body);

        expect(response.body.transactionId).to.exist;
        expect(response.body.type).to.eq(data.creditEUR.type);
        expect(response.body.amount).to.eq(data.creditEUR.amount);
        expect(response.body.currency).to.eq(data.creditEUR.currency);
      });
    });
  });

  it("[positive] should create a valid debit transaction", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.creditEUR).then(() => {
        WalletApi.createTransaction(walletId, token, data.debitEUR).then((response) => {
          expect(response.status).to.be.oneOf([200, 201, 202]);
          cy.validateSchema(transactionSchema, response.body);

          expect(response.body.transactionId).to.exist;
          expect(response.body.type).to.eq(data.debitEUR.type);
          expect(response.body.amount).to.eq(data.debitEUR.amount);
        });
      });
    });
  });

  it("[edge] should create credit transaction with decimal amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.decimalCredit).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        cy.validateSchema(transactionSchema, response.body);

        expect(response.body.amount).to.eq(data.decimalCredit.amount);
      });
    });
  });

  it("[negative] should reject negative amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.negativeAmount).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.exist;
      });
    });
  });

  it("[negative] should reject zero amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.zeroAmount).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.exist;
      });
    });
  });

  it("[negative] should reject missing amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.missingAmount).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.exist;
      });
    });
  });

  it("[negative] should reject unsupported currency", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.unsupportedCurrency).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.exist;
      });
    });
  });

  it("[negative] should reject invalid transaction type", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.invalidType).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.exist;
      });
    });
  });

  it("[security] should reject transaction without bearer token", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, null, data.creditEUR).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.exist;
      });
    });
  });

  it("[business-rule] should reject debit greater than available balance", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.largeDebitEUR).then((response) => {
        expect(response.status).to.be.oneOf([400, 409, 422]);
        expect(response.body).to.exist;
      });
    });
  });
});