import { AuthApi } from "../../support/api/authApi";
import { UserApi } from "../../support/api/userApi";
import { WalletApi } from "../../support/api/walletApi";
import {
  transactionSchema,
  walletSchema,
  transactionHistorySchema,
} from "../../schemas/walletSchemas";
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
  let transactionData;

  before(() => {
    cy.fixture("transactionData").then((data) => {
      transactionData = data;
    });

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
        UserAssertions.validateUserInfoResponse(userResponse, userInfoSchema);
        walletId = userResponse.body.walletId;
      });
  });

  context("Security validation", () => {
    it("[security] should reject transaction without bearer token", () => {
      WalletApi.createTransaction(
        walletId,
        null,
        transactionData.creditEUR
      ).then((response) => {
        TransactionAssertions.validateUnauthorized(response);
      });
    });
  });

  context("Positive transaction creation", () => {
    it("[positive] should create valid credit transactions for supported currencies", () => {
      transactionData.supportedCurrencies.forEach((transaction) => {
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

    it("[positive] should create credit transaction with decimal amount", () => {
      WalletApi.createTransaction(
        walletId,
        token,
        transactionData.decimalCredit
      ).then((response) => {
        TransactionAssertions.validateSuccess(
          response,
          transactionData.decimalCredit,
          transactionSchema
        );
      });
    });

    it("[positive] should create a valid debit transaction", () => {
      WalletApi.createTransaction(
        walletId,
        token,
        transactionData.creditEUR
      ).then(() => {
        WalletApi.createTransaction(
          walletId,
          token,
          transactionData.debitEUR
        ).then((response) => {
          TransactionAssertions.validateSuccess(
            response,
            transactionData.debitEUR,
            transactionSchema
          );
        });
      });
    });
  });

  context("Wallet balance validation", () => {
    it("[business] should increase balance after approved credit transaction", () => {
      const payload = transactionData.balanceCreditEUR;

      WalletApi.getWallet(walletId, token).then((beforeWallet) => {
        expect(beforeWallet.status).to.eq(200);
        cy.validateSchema(walletSchema, beforeWallet.body);

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
                cy.validateSchema(walletSchema, afterWallet.body);

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
      const creditPayload = transactionData.balanceSetupCreditEUR;
      const debitPayload = transactionData.balanceDebitEUR;

      WalletApi.createTransaction(walletId, token, creditPayload).then(
        (creditResponse) => {
          TransactionAssertions.validateTransactionResponse(
            creditResponse,
            creditPayload
          );

          WalletApi.getWallet(walletId, token).then((beforeWallet) => {
            expect(beforeWallet.status).to.eq(200);
            cy.validateSchema(walletSchema, beforeWallet.body);

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
                    cy.validateSchema(walletSchema, afterWallet.body);

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

  context("Transaction retrieval", () => {
    it("[positive] should retrieve transaction by transaction ID", () => {
      const payload = transactionData.lookupCreditUSD;

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
              cy.validateSchema(transactionSchema, response.body);

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
      const payload = transactionData.historyCreditAED;

      WalletApi.createTransaction(walletId, token, payload).then(
        (createResponse) => {
          TransactionAssertions.validateTransactionResponse(
            createResponse,
            payload
          );

          const transactionId = createResponse.body.transactionId;

          WalletApi.getTransactions(walletId, token).then((historyResponse) => {
            expect(historyResponse.status).to.eq(200);
            cy.validateSchema(transactionHistorySchema, historyResponse.body);

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

  context("Negative validation", () => {
    it("[negative] should reject invalid transaction payloads", () => {
      const invalidPayloads = [
        transactionData.negativeAmount,
        transactionData.zeroAmount,
        transactionData.missingAmount,
        transactionData.unsupportedCurrency,
        transactionData.invalidType,
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

  context("Business rule validation", () => {
    it("[business-rule] should reject debit greater than available balance", () => {
      WalletApi.createTransaction(
        walletId,
        token,
        transactionData.largeDebitEUR
      ).then((response) => {
        TransactionAssertions.validateInsufficientBalance(response);
      });
    });
  });
});