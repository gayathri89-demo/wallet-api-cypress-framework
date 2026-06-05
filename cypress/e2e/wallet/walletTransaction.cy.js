import { AuthApi } from "../../support/api/authApi";
import { UserApi } from "../../support/api/userApi";
import { WalletApi } from "../../support/api/walletApi";
import { transactionSchema } from "../../schemas/walletSchemas";
import { userTokenResponseSchema } from "../../schemas/userSchemas";
import { userInfoSchema } from "../../schemas/userSchemas";
import { TransactionAssertions } from "../../support/assertions/transactionAssertions";

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
        cy.validateSchema(userTokenResponseSchema, loginResponse.body);
        token = loginResponse.body.token;

        return UserApi.getUserInfo(loginResponse.body.userId, token);
      })
      .then((userResponse) => {
        expect(userResponse.status).to.eq(200);
        expect(userResponse.body.walletId).to.exist;
        cy.validateSchema(userInfoSchema, userResponse.body);
        walletId = userResponse.body.walletId;
      });
  });

  context("Multi-currency wallet transactions", () => {
    it("[positive] should create valid EUR credit transaction", () => {
      cy.fixture("transactionData").then((data) => {
        const transaction = data.supportedCurrencies.find(
          (item) => item.currency === "EUR"
        );

        WalletApi.createTransaction(walletId, token, transaction).then((response) => {
          TransactionAssertions.validateSuccess(
            response,
            transaction,
            transactionSchema
          );
        });
      });
    });

    it("[positive] should create valid USD credit transaction", () => {
      cy.fixture("transactionData").then((data) => {
        const transaction = data.supportedCurrencies.find(
          (item) => item.currency === "USD"
        );

        WalletApi.createTransaction(walletId, token, transaction).then((response) => {
          TransactionAssertions.validateSuccess(
            response,
            transaction,
            transactionSchema
          );
        });
      });
    });

    it("[positive] should create valid AED credit transaction", () => {
      cy.fixture("transactionData").then((data) => {
        const transaction = data.supportedCurrencies.find(
          (item) => item.currency === "AED"
        );

        WalletApi.createTransaction(walletId, token, transaction).then((response) => {
          TransactionAssertions.validateSuccess(
            response,
            transaction,
            transactionSchema
          );
        });
      });
    });
  });

  it("[positive] should create a valid debit transaction", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.creditEUR).then(() => {
        WalletApi.createTransaction(walletId, token, data.debitEUR).then((response) => {
          TransactionAssertions.validateSuccess(
            response,
            data.debitEUR,
            transactionSchema
          );
        });
      });
    });
  });

  it("[edge] should create credit transaction with decimal amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.decimalCredit).then((response) => {
        TransactionAssertions.validateSuccess(
          response,
          data.decimalCredit,
          transactionSchema
        );
      });
    });
  });

  it("[negative] should reject negative amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.negativeAmount).then((response) => {
        TransactionAssertions.validateValidationError(response);
      });
    });
  });

  it("[negative] should reject zero amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.zeroAmount).then((response) => {
        TransactionAssertions.validateValidationError(response);
      });
    });
  });

  it("[negative] should reject missing amount", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.missingAmount).then((response) => {
        TransactionAssertions.validateValidationError(response);
      });
    });
  });

  it("[negative] should reject unsupported currency", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.unsupportedCurrency).then((response) => {
        TransactionAssertions.validateValidationError(response);
      });
    });
  });

  it("[negative] should reject invalid transaction type", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.invalidType).then((response) => {
        TransactionAssertions.validateValidationError(response);
      });
    });
  });

  it("[security] should reject transaction without bearer token", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, null, data.creditEUR).then((response) => {
        TransactionAssertions.validateUnauthorized(response);
      });
    });
  });

  it("[business-rule] should reject debit greater than available balance", () => {
    cy.fixture("transactionData").then((data) => {
      WalletApi.createTransaction(walletId, token, data.largeDebitEUR).then((response) => {
        TransactionAssertions.validateInsufficientBalance(response);
      });
    });
  });
});