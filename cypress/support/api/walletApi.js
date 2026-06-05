// In-memory mock state used only when USE_MOCKS=true.
// This allows business tests to verify balance changes after transactions.
const mockWalletState = {
  walletId: "mock-wallet-id",
  currencyClips: [
    {
      currency: "EUR",
      balance: 100,
      lastTransaction: "2024-11-15T05:30:00Z",
      transactionCount: 1,
    },
  ],
  createdAt: "2024-11-01T00:00:00Z",
  updatedAt: "2024-11-15T05:30:00Z",
};

const getOrCreateMockCurrencyClip = (currency) => {
  let clip = mockWalletState.currencyClips.find(
    (currencyClip) => currencyClip.currency === currency
  );

  if (!clip) {
    clip = {
      currency,
      balance: 0,
      lastTransaction: null,
      transactionCount: 0,
    };

    mockWalletState.currencyClips.push(clip);
  }

  return clip;
};

const updateMockWalletBalance = (payload) => {
  const clip = getOrCreateMockCurrencyClip(payload.currency);
  const now = new Date().toISOString();

  if (payload.type === "credit") {
    clip.balance += payload.amount;
  }

  if (payload.type === "debit") {
    clip.balance -= payload.amount;
  }

  clip.transactionCount += 1;
  clip.lastTransaction = now;
  mockWalletState.updatedAt = now;
};

export class WalletApi {
  static getWallet(walletId, token) {
    if (Cypress.env("useMocks")) {
      return cy.fixture("mockResponses/walletApiMock").then((mock) => {
        if (!token) {
          return {
            status: 401,
            body: mock.unauthorizedResponse,
          };
        }

        if (!walletId || walletId === "invalid-wallet-id") {
          return {
            status: 404,
            body: mock.errorResponse,
          };
        }

        return {
          status: 200,
          body: {
            ...mockWalletState,
            walletId,
            currencyClips: mockWalletState.currencyClips.map((clip) => ({
              ...clip,
            })),
          },
        };
      });
    }

    return cy.request({
      method: "GET",
      url: `${Cypress.env("apiBaseUrl")}/wallet/${walletId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  }

  static createTransaction(walletId, token, payload) {
    if (Cypress.env("useMocks")) {
      return cy.fixture("mockResponses/walletApiMock").then((mock) => {
        if (!token) {
          return {
            status: 401,
            body: mock.unauthorizedResponse,
          };
        }

        if (!walletId || walletId === "invalid-wallet-id") {
          return {
            status: 404,
            body: mock.errorResponse,
          };
        }

        if (
          !payload ||
          payload.amount === undefined ||
          payload.amount <= 0 ||
          !payload.currency ||
          payload.currency === "XYZ" ||
          !["credit", "debit"].includes(payload.type)
        ) {
          return {
            status: 422,
            body: mock.errorResponse,
          };
        }

        if (payload.type === "debit" && payload.amount >= 999999) {
          return {
            status: 409,
            body: mock.insufficientBalanceResponse,
          };
        }

        updateMockWalletBalance(payload);

        return {
          status: 201,
          body: {
            ...mock.transactionSuccess,
            currency: payload.currency,
            amount: payload.amount,
            type: payload.type,
            updatedAt: mockWalletState.updatedAt,
          },
        };
      });
    }

    return cy.request({
      method: "POST",
      url: `${Cypress.env("apiBaseUrl")}/wallet/${walletId}/transaction`,
      failOnStatusCode: false,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: payload,
    });
  }

  static getTransaction(walletId, transactionId, token) {
    if (Cypress.env("useMocks")) {
      return cy.fixture("mockResponses/walletApiMock").then((mock) => {
        if (!token) {
          return {
            status: 401,
            body: mock.unauthorizedResponse,
          };
        }

        if (!walletId || walletId === "invalid-wallet-id" || !transactionId) {
          return {
            status: 404,
            body: mock.errorResponse,
          };
        }

        return {
          status: 200,
          body: {
            ...mock.transactionSuccess,
            transactionId,
          },
        };
      });
    }

    return cy.request({
      method: "GET",
      url: `${Cypress.env(
        "apiBaseUrl"
      )}/wallet/${walletId}/transaction/${transactionId}`,
      failOnStatusCode: false,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }

  static getTransactions(walletId, token) {
    if (Cypress.env("useMocks")) {
      return cy.fixture("mockResponses/walletApiMock").then((mock) => {
        if (!token) {
          return {
            status: 401,
            body: mock.unauthorizedResponse,
          };
        }

        if (!walletId || walletId === "invalid-wallet-id") {
          return {
            status: 404,
            body: mock.errorResponse,
          };
        }

        return {
          status: 200,
          body: {
            transactions: [mock.transactionSuccess],
          },
        };
      });
    }

    return cy.request({
      method: "GET",
      url: `${Cypress.env("apiBaseUrl")}/wallet/${walletId}/transactions`,
      failOnStatusCode: false,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }
}