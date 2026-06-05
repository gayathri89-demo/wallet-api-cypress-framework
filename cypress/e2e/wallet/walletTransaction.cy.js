import { AuthApi } from "../../support/api/authApi";
import { UserApi } from "../../support/api/userApi";
import { WalletApi } from "../../support/api/walletApi";
import { transactionSchema } from "../../schemas/walletSchemas";
import { userTokenResponseSchema } from "../../schemas/userSchemas";
import { userInfoSchema } from "../../schemas/userSchemas";
import { TransactionAssertions } from "../../support/assertions/transactionAssertions";
import { UserAssertions } from "../../support/assertions/userAssertions";


// Add helper here
const getCurrencyClip = (wallet, currency) => {
  if (!wallet || !Array.isArray(wallet.currencyClips)) {
    return undefined;
  }

  return wallet.currencyClips.find(
    (clip) => clip.currency === currency
  );
};

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
      UserAssertions.validateLoginResponse(
        loginResponse,
        userTokenResponseSchema
      );

      token = loginResponse.body.token;

      return UserApi.getUserInfo(
        loginResponse.body.userId,
        token
      );
    })
    .then((userResponse) => {
      UserAssertions.validateUserInfoResponse(
        userResponse,
        userInfoSchema
      );

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

  it("[business] should increase balance after approved credit transaction", () => {
  const payload = {
    currency: "EUR",
    amount: 50,
    type: "credit",
  };

  WalletApi.getWallet(walletId, token).then((beforeWallet) => {
    expect(beforeWallet.status).to.eq(200);

    const beforeClip = getCurrencyClip(beforeWallet.body, payload.currency);
    const beforeBalance = beforeClip ? beforeClip.balance : 0;

    WalletApi.createTransaction(walletId, token, payload).then((transactionResponse) => {
      TransactionAssertions.validateTransactionResponse(transactionResponse, payload);

      if (
        transactionResponse.body.status === "finished" &&
        transactionResponse.body.outcome === "approved"
      ) {
        WalletApi.getWallet(walletId, token).then((afterWallet) => {
          expect(afterWallet.status).to.eq(200);

          const afterClip = getCurrencyClip(afterWallet.body, payload.currency);

          expect(afterClip).to.exist;
          expect(afterClip.balance).to.eq(beforeBalance + payload.amount);
          expect(afterClip.transactionCount).to.be.greaterThan(0);
          expect(afterClip.lastTransaction).to.exist;
        });
      }
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