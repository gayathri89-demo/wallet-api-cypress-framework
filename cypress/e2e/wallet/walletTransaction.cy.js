import { AuthApi } from "../../support/api/authApi";
import { UserApi } from "../../support/api/userApi";
import { WalletApi } from "../../support/api/walletApi";
import { transactionSchema } from "../../schemas/walletSchemas";
import {
  userTokenResponseSchema,
  userInfoSchema,
} from "../../schemas/userSchemas";
import { TransactionAssertions } from "../../support/assertions/transactionAssertions";
import { UserAssertions } from "../../support/assertions/userAssertions";

const getCurrencyClip = (wallet, currency) => {
  if (!wallet || !Array.isArray(wallet.currencyClips)) {
    return undefined;
  }

  return wallet.currencyClips.find((clip) => clip.currency === currency);
};

describe("Wallet Transaction API - POST /wallet/{walletId}/transaction", () => {
  let token;
  let walletId;

  before(() => {
    const credentials = {
      username: Cypress.env("username"),
      password: Cypress.env("password"),
    };

    AuthApi.login(credentials)
      .then((loginResponse) => {
        UserAssertions.validateLoginResponse(
          loginResponse,
          userTokenResponseSchema
        );

        token = loginResponse.body.token;

        return UserApi.getUserInfo(loginResponse.body.userId, token);
      })
      .then((userResponse) => {
        UserAssertions.validateUserInfoResponse(
          userResponse,
          userInfoSchema
        );

        walletId = userResponse.body.walletId;
      });
  });

  context("1. Security validation", () => {
    it("[security] should reject transaction without bearer token", () => {
      cy.fixture("transactionData").then((data) => {
        WalletApi.createTransaction(walletId, null, data.creditEUR).then(
          (response) => {
            TransactionAssertions.validateUnauthorized(response);
          }
        );
      });
    });
  });

  context("2. Positive transaction creation", () => {
    it("[positive] should create valid credit transactions for supported currencies", () => {
      cy.fixture("transactionData").then((data) => {
        data.supportedCurrencies.forEach((transaction) => {
          WalletApi.createTransaction(walletId, token, transaction).then(
            (response) => {
              TransactionAssertions.validateSuccess(
                response,
                transaction,
                transactionSchema
              );
            }
          );
        });
      });
    });

    it("[positive] should create credit transaction with decimal amount", () => {
      cy.fixture("transactionData").then((data) => {
        WalletApi.createTransaction(walletId, token, data.decimalCredit).then(
          (response) => {
            TransactionAssertions.validateSuccess(
              response,
              data.decimalCredit,
              transactionSchema
            );
          }
        );
      });
    });

    it("[positive] should create a valid debit transaction", () => {
      cy.fixture("transactionData").then((data) => {
        WalletApi.createTransaction(walletId, token, data.creditEUR).then(() => {
          WalletApi.createTransaction(walletId, token, data.debitEUR).then(
            (response) => {
              TransactionAssertions.validateSuccess(
                response,
                data.debitEUR,
                transactionSchema
              );
            }
          );
        });
      });
    });
  });

  context("3. Wallet balance validation", () => {
    it("[business] should increase balance after approved credit transaction", () => {
      const payload = {
        currency: "EUR",
        amount: 50,
        type: "credit",
      };

      WalletApi.getWallet(walletId, token).then((beforeWallet) => {
        expect(beforeWallet.status).to.eq(200);

        const beforeBalance =
          getCurrencyClip(beforeWallet.body, payload.currency)?.balance || 0;

        WalletApi.createTransaction(walletId, token, payload).then(
          (transactionResponse) => {
            TransactionAssertions.validateTransactionResponse(
              transactionResponse,
              payload
            );

            if (
              transactionResponse.body.status === "finished" &&
              transactionResponse.body.outcome === "approved"
            ) {
              WalletApi.getWallet(walletId, token).then((afterWallet) => {
                expect(afterWallet.status).to.eq(200);

                const afterClip = getCurrencyClip(
                  afterWallet.body,
                  payload.currency
                );

                expect(afterClip).to.exist;
                expect(afterClip.balance).to.eq(beforeBalance + payload.amount);
                expect(afterClip.transactionCount).to.be.greaterThan(0);
                expect(afterClip.lastTransaction).to.exist;
              });
            }
          }
        );
      });
    });

    it("[business] should decrease balance after approved debit transaction", () => {
      const creditPayload = {
        currency: "EUR",
        amount: 100,
        type: "credit",
      };

      const debitPayload = {
        currency: "EUR",
        amount: 20,
        type: "debit",
      };

      WalletApi.createTransaction(walletId, token, creditPayload).then(
        (creditResponse) => {
          TransactionAssertions.validateTransactionResponse(
            creditResponse,
            creditPayload
          );

          WalletApi.getWallet(walletId, token).then((beforeWallet) => {
            expect(beforeWallet.status).to.eq(200);

            const beforeBalance =
              getCurrencyClip(beforeWallet.body, debitPayload.currency)
                ?.balance || 0;

            WalletApi.createTransaction(walletId, token, debitPayload).then(
              (debitResponse) => {
                TransactionAssertions.validateTransactionResponse(
                  debitResponse,
                  debitPayload
                );

                if (
                  debitResponse.body.status === "finished" &&
                  debitResponse.body.outcome === "approved"
                ) {
                  WalletApi.getWallet(walletId, token).then((afterWallet) => {
                    expect(afterWallet.status).to.eq(200);

                    const afterClip = getCurrencyClip(
                      afterWallet.body,
                      debitPayload.currency
                    );

                    expect(afterClip).to.exist;
                    expect(afterClip.balance).to.eq(
                      beforeBalance - debitPayload.amount
                    );
                  });
                }
              }
            );
          });
        }
      );
    });
  });

  context("4. Transaction retrieval", () => {
    it("[positive] should retrieve transaction by transaction ID", () => {
      const payload = {
        currency: "USD",
        amount: 25,
        type: "credit",
      };

      WalletApi.createTransaction(walletId, token, payload).then(
        (createResponse) => {
          TransactionAssertions.validateTransactionResponse(
            createResponse,
            payload
          );

          const transactionId = createResponse.body.transactionId;

          WalletApi.getTransaction(walletId, transactionId, token).then(
            (response) => {
              expect(response.status).to.eq(200);
              expect(response.body.transactionId).to.eq(transactionId);
              expect(response.body.status).to.be.oneOf([
                "pending",
                "finished",
              ]);
            }
          );
        }
      );
    });

    it("[positive] should include created transaction in transaction history", () => {
      const payload = {
        currency: "AED",
        amount: 40,
        type: "credit",
      };

      WalletApi.createTransaction(walletId, token, payload).then(
        (createResponse) => {
          TransactionAssertions.validateTransactionResponse(
            createResponse,
            payload
          );

          const transactionId = createResponse.body.transactionId;

          WalletApi.getTransactions(walletId, token).then((historyResponse) => {
            expect(historyResponse.status).to.eq(200);

            const transactions =
              historyResponse.body.transactions || historyResponse.body;

            const exists = transactions.some(
              (txn) => txn.transactionId === transactionId
            );

            expect(exists).to.be.true;
          });
        }
      );
    });
  });

  context("5. Negative validation", () => {
    it("[negative] should reject invalid transaction payloads", () => {
      cy.fixture("transactionData").then((data) => {
        const invalidPayloads = [
          data.negativeAmount,
          data.zeroAmount,
          data.missingAmount,
          data.unsupportedCurrency,
          data.invalidType,
        ];

        invalidPayloads.forEach((payload) => {
          WalletApi.createTransaction(walletId, token, payload).then(
            (response) => {
              TransactionAssertions.validateValidationError(response);
            }
          );
        });
      });
    });
  });

  context("6. Business rule validation", () => {
    it("[business-rule] should reject debit greater than available balance", () => {
      cy.fixture("transactionData").then((data) => {
        WalletApi.createTransaction(walletId, token, data.largeDebitEUR).then(
          (response) => {
            TransactionAssertions.validateInsufficientBalance(response);
          }
        );
      });
    });
  });
});