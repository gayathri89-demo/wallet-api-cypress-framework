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

const getCurrencyClips = (wallet, currency) => {
  if (!wallet || !Array.isArray(wallet.currencyClips)) {
    return [];
  }

  return wallet.currencyClips.filter((clip) => clip.currency === currency);
};

const getClipBalance = (wallet, currency) => {
  return getCurrencyClip(wallet, currency)?.balance || 0;
};

const validateTransactionState = (response) => {
  expect(response.body.transactionId).to.exist;
  expect(response.body.createdAt).to.exist;
  expect(response.body.status).to.be.oneOf(["pending", "finished"]);

  if (response.body.status === "pending") {
    expect(response.body.outcome).to.not.exist;
  }

  if (response.body.status === "finished") {
    expect(response.body.outcome).to.be.oneOf(["approved", "denied"]);
    expect(response.body.updatedAt).to.exist;
  }
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
            validateTransactionState(response);
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
        validateTransactionState(response);
      });
    });

    it("[positive] should create a valid debit transaction", () => {
      WalletApi.createTransaction(
        walletId,
        token,
        transactionData.creditEUR
      ).then((creditResponse) => {
        TransactionAssertions.validateTransactionResponse(
          creditResponse,
          transactionData.creditEUR
        );

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
          validateTransactionState(response);
        });
      });
    });

    it("[async] should return valid pending or finished transaction status", () => {
      const payload = transactionData.creditEUR;

      WalletApi.createTransaction(walletId, token, payload).then((response) => {
        TransactionAssertions.validateTransactionResponse(response, payload);
        validateTransactionState(response);
      });
    });
  });

  context("Wallet balance validation", () => {
    it("[business] should increase balance after approved credit transaction", () => {
      const payload = transactionData.balanceCreditEUR;

      WalletApi.getWallet(walletId, token).then((beforeWallet) => {
        TransactionAssertions.validateOkResponse(beforeWallet);
        cy.validateSchema(walletSchema, beforeWallet.body);

        const beforeBalance = getClipBalance(beforeWallet.body, payload.currency);

        WalletApi.createTransaction(walletId, token, payload).then(
          (transactionResponse) => {
            TransactionAssertions.validateTransactionResponse(
              transactionResponse,
              payload
            );

            validateTransactionState(transactionResponse);

            WalletApi.getWallet(walletId, token).then((afterWallet) => {
              TransactionAssertions.validateOkResponse(afterWallet);
              cy.validateSchema(walletSchema, afterWallet.body);

              const afterBalance = getClipBalance(
                afterWallet.body,
                payload.currency
              );

              const afterClip = getCurrencyClip(
                afterWallet.body,
                payload.currency
              );

              if (
                transactionResponse.body.status === "finished" &&
                transactionResponse.body.outcome === "approved"
              ) {
                expect(afterClip).to.exist;
                expect(afterBalance).to.eq(beforeBalance + payload.amount);
                expect(afterClip.transactionCount).to.be.greaterThan(0);
                expect(afterClip.lastTransaction).to.exist;
              }

              if (
                transactionResponse.body.status === "finished" &&
                transactionResponse.body.outcome === "denied"
              ) {
                expect(afterBalance).to.eq(beforeBalance);
              }

              if (transactionResponse.body.status === "pending") {
                cy.log(
                  "Transaction is pending. Balance update will be validated after processing."
                );
              }
            });
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
            TransactionAssertions.validateOkResponse(beforeWallet);
            cy.validateSchema(walletSchema, beforeWallet.body);

            const beforeBalance = getClipBalance(
              beforeWallet.body,
              debitPayload.currency
            );

            WalletApi.createTransaction(walletId, token, debitPayload).then(
              (debitResponse) => {
                TransactionAssertions.validateTransactionResponse(
                  debitResponse,
                  debitPayload
                );

                validateTransactionState(debitResponse);

                WalletApi.getWallet(walletId, token).then((afterWallet) => {
                  TransactionAssertions.validateOkResponse(afterWallet);
                  cy.validateSchema(walletSchema, afterWallet.body);

                  const afterBalance = getClipBalance(
                    afterWallet.body,
                    debitPayload.currency
                  );

                  const afterClip = getCurrencyClip(
                    afterWallet.body,
                    debitPayload.currency
                  );

                  if (
                    debitResponse.body.status === "finished" &&
                    debitResponse.body.outcome === "approved"
                  ) {
                    expect(afterClip).to.exist;
                    expect(afterBalance).to.eq(
                      beforeBalance - debitPayload.amount
                    );
                    expect(afterBalance).to.be.at.least(0);
                  }

                  if (
                    debitResponse.body.status === "finished" &&
                    debitResponse.body.outcome === "denied"
                  ) {
                    expect(afterBalance).to.eq(beforeBalance);
                  }

                  if (debitResponse.body.status === "pending") {
                    cy.log(
                      "Debit transaction is pending. Balance update will be validated after processing."
                    );
                  }
                });
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

          validateTransactionState(createResponse);

          const transactionId = createResponse.body.transactionId;

          WalletApi.getTransaction(walletId, transactionId, token).then(
            (response) => {
              TransactionAssertions.validateOkResponse(response);
              cy.validateSchema(transactionSchema, response.body);

              expect(response.body.transactionId).to.eq(transactionId);
              validateTransactionState(response);
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

          validateTransactionState(createResponse);

          const transactionId = createResponse.body.transactionId;

          WalletApi.getTransactions(walletId, token).then((historyResponse) => {
            TransactionAssertions.validateOkResponse(historyResponse);
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

    it("[business-rule] should not create duplicate currency clips for the same currency", () => {
      const payload = transactionData.creditEUR;

      WalletApi.createTransaction(walletId, token, payload).then(
        (firstResponse) => {
          TransactionAssertions.validateTransactionResponse(
            firstResponse,
            payload
          );

          WalletApi.createTransaction(walletId, token, payload).then(
            (secondResponse) => {
              TransactionAssertions.validateTransactionResponse(
                secondResponse,
                payload
              );

              WalletApi.getWallet(walletId, token).then((walletResponse) => {
                TransactionAssertions.validateOkResponse(walletResponse);
                cy.validateSchema(walletSchema, walletResponse.body);

                const clips = getCurrencyClips(
                  walletResponse.body,
                  payload.currency
                );

                expect(clips.length).to.be.at.most(1);

                if (clips.length === 1) {
                  expect(clips[0].currency).to.eq(payload.currency);
                  expect(clips[0].balance).to.be.at.least(0);
                }
              });
            }
          );
        }
      );
    });
  });
});