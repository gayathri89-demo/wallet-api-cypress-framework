# Wallet API Cypress Automation Framework

## Overview

This project contains an automated API test suite for the Wallet REST API challenge.

The main endpoint under test is:

```http
POST /wallet/{walletId}/transaction
```

The framework also validates supporting wallet flows such as wallet balance retrieval, transaction lookup, transaction history, security checks, schema validation, and key business rules.

The suite is built with Cypress and JavaScript using a layered framework design. Test specs do not call `cy.request()` directly. Instead, API calls are handled through reusable API client classes, validations are centralized in assertion helpers, schemas are managed separately, and test data is driven through fixtures.

---

## Technology Stack

- Cypress
- JavaScript
- Mocha / Chai assertions
- AJV schema validation
- AJV formats
- Mochawesome reporting
- dotenv environment configuration
- GitHub Actions CI

---

## Framework Features

- Layered API automation architecture
- Reusable API clients for Auth, User, and Wallet APIs
- Centralized assertion classes
- AJV schema validation for API contracts
- Fixture-driven test data
- Mock mode support using `USE_MOCKS=true`
- Real API mode support using `USE_MOCKS=false`
- Wallet credit and debit transaction validation
- Multi-currency transaction coverage
- Decimal amount validation
- Wallet balance business-rule validation
- Transaction retrieval and transaction history verification
- Mochawesome HTML and JSON reporting
- Failure screenshots through Cypress
- GitHub Actions workflow support

---

## Project Structure

```text
wallet-api-cypress-framework/
├── .github/
│   └── workflows/
│       └── api-test.yml
│
├── cypress/
│   ├── e2e/
│   │   └── wallet/
│   │       └── walletTransaction.cy.js
│   │
│   ├── fixtures/
│   │   ├── transactionData.json
│   │   └── mockResponses/
│   │       └── walletApiMock.json
│   │
│   ├── schemas/
│   │   ├── userSchemas.js
│   │   └── walletSchemas.js
│   │
│   └── support/
│       ├── api/
│       │   ├── authApi.js
│       │   ├── userApi.js
│       │   └── walletApi.js
│       │
│       ├── assertions/
│       │   ├── transactionAssertions.js
│       │   └── userAssertions.js
│       │
│       ├── constants/
│       │   └── httpStatus.js
│       │
│       ├── commands.js
│       └── e2e.js
│
├── cypress.config.js
├── package.json
├── README.md
└── TESTPLAN.md
```

---

## Framework Architecture

The framework uses a clean layered structure. Each layer has a separate responsibility.

```text
┌──────────────────────────────────────────────┐
│                 Test Spec Layer              │
│                                              │
│ cypress/e2e/wallet/walletTransaction.cy.js   │
│ - Defines test scenarios                     │
│ - Calls API clients                          │
│ - Uses assertion helpers                     │
│ - Uses schemas for contract validation       │
└───────────────────────────┬──────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────┐
│                   API Layer                  │
│                                              │
│ support/api/authApi.js                       │
│ support/api/userApi.js                       │
│ support/api/walletApi.js                     │
│                                              │
│ - Wraps cy.request()                         │
│ - Handles endpoint URLs                      │
│ - Handles headers and tokens                 │
│ - Supports mock and real API execution       │
└───────────────────────────┬──────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Assertion Layer  │ │ Schema Layer     │ │ Fixture Layer    │
│                  │ │                  │ │                  │
│ UserAssertions   │ │ userSchemas.js   │ │ transactionData  │
│ TxAssertions     │ │ walletSchemas.js │ │ mockResponses    │
│                  │ │                  │ │                  │
│ - Status checks  │ │ - AJV contracts  │ │ - Test payloads  │
│ - Body checks    │ │ - Response shape │ │ - Mock objects   │
│ - Business rules │ │ - Required data  │ │ - Reusable data  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
              │             │             │
              └─────────────┼─────────────┘
                            ▼
┌──────────────────────────────────────────────┐
│          Environment and Configuration       │
│                                              │
│ .env                                         │
│ .env.example                                 │
│ cypress.config.js                            │
│ Cypress.env()                                │
│                                              │
│ - BASE_URL                                   │
│ - USERNAME                                   │
│ - PASSWORD                                   │
│ - SERVICE_ID                                 │
│ - USE_MOCKS                                  │
└──────────────────────────────────────────────┘
```

### Why this architecture is used

- Test files stay readable and focused on business scenarios.
- API implementation details are reusable and hidden inside API classes.
- Assertions are centralized, which avoids duplicated validation logic.
- Schemas are stored separately and reused across tests.
- Fixtures make test data easier to maintain.
- Mock mode allows CI execution even when the real challenge API is unavailable.

---

## Test Execution Flow

This is the execution sequence followed when the wallet API suite runs.

```text
┌──────────────────────┐
│ Cypress execution    │
│ starts               │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Load cypress.config  │
│ Load .env values     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Check USE_MOCKS      │
└───────┬────────┬─────┘
        │        │
        ▼        ▼
┌────────────┐ ┌────────────┐
│ Mock mode  │ │ Real API   │
│ fixtures   │ │ requests   │
└─────┬──────┘ └─────┬──────┘
      │              │
      └──────┬───────┘
             ▼
┌──────────────────────┐
│ before() hook        │
│ - Load fixture data  │
│ - Login              │
│ - Validate login     │
│ - Get user info      │
│ - Validate user info │
│ - Store token        │
│ - Store walletId     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Execute test context │
│ - Security           │
│ - Positive flows     │
│ - Balance checks     │
│ - Retrieval checks   │
│ - Negative checks    │
│ - Business rules     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ API client call      │
│ WalletApi methods    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Response received    │
└───────┬────────┬─────┘
        │        │
        ▼        ▼
┌────────────┐ ┌────────────┐
│ Assertion  │ │ AJV schema │
│ validation │ │ validation │
└─────┬──────┘ └─────┬──────┘
      │              │
      └──────┬───────┘
             ▼
┌──────────────────────┐
│ Business validation  │
│ - Balance increase   │
│ - Balance decrease   │
│ - No negative balance│
│ - History contains tx│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Mochawesome report   │
│ HTML + JSON output   │
└──────────────────────┘
```

---

## Test Approach

The test suite follows a realistic wallet workflow:

1. Authenticate the user and obtain a Bearer token.
2. Retrieve user information.
3. Extract the user's wallet ID.
4. Create wallet credit and debit transactions.
5. Validate API response status codes.
6. Validate API response body using assertion helpers.
7. Validate API contracts using AJV schemas.
8. Verify wallet balance changes for approved transactions.
9. Verify transaction retrieval by transaction ID.
10. Verify transaction history contains the created transaction.
11. Validate negative scenarios and business-rule failures.

---

## Test Coverage

### Authentication and Setup

- Login through Auth API
- User information retrieval
- Wallet ID extraction
- Bearer token usage

### Functional Coverage

- Valid credit transaction
- Valid debit transaction
- Credit transaction with decimal amount
- Multi-currency transactions
- Transaction retrieval by ID
- Transaction history verification

### Business Rule Coverage

- Approved credit increases wallet balance
- Approved debit decreases wallet balance
- Debit cannot make wallet balance negative
- Same currency should not create duplicate currency clips
- Denied transactions should not change wallet balance
- Pending transactions are handled safely without forcing balance assertions too early

### Security Coverage

- Transaction request without Bearer token is rejected

### Payload Validation Coverage

- Negative amount
- Zero amount
- Missing amount
- Unsupported currency
- Invalid transaction type

### Schema Validation Coverage

- Login response schema
- User information response schema
- Wallet response schema
- Transaction response schema
- Transaction history response schema

---

## Mock Mode and Real API Mode

The framework supports two execution modes.

### Mock Mode

Use mock mode when the real API is unavailable or when running in CI.

```env
USE_MOCKS=true
```

In mock mode:

- API classes return controlled fixture-based responses.
- Wallet mock state is updated in memory.
- Balance tests can verify credit and debit behavior.
- CI execution is stable and independent of the real environment.

### Real API Mode

Use real API mode when testing against the actual challenge API.

```env
USE_MOCKS=false
```

In real API mode:

- API classes call the real endpoints.
- The framework uses `BASE_URL`, `USERNAME`, `PASSWORD`, and `SERVICE_ID` from `.env`.
- Tests validate actual API behavior.

---

## Prerequisites

- Node.js 18 or higher
- npm
- Access to the challenge API, if running in real API mode
- Valid credentials, if running in real API mode

Check versions:

```bash
node -v
npm -v
```

---

## Installation

Install dependencies:

```bash
npm install
```

For CI environments, use:

```bash
npm ci
```

---

## Environment Configuration

Create a `.env` file in the project root.

```env
BASE_URL=https://challenge.test.local/challenge/api/v1
USERNAME=your_username
PASSWORD=your_password
SERVICE_ID=your_service_id
USE_MOCKS=true
```

For local mock execution:

```env
USE_MOCKS=true
```

For real API execution:

```env
USE_MOCKS=false
```

Sensitive values must not be committed to source control.

---

## Running Tests

Run the wallet API suite:

```bash
npm run test:wallet
```

Run all Cypress tests:

```bash
npm test
```

Run Cypress in interactive mode:

```bash
npm run test:open
```

Run the spec directly:

```bash
npx cypress run --spec cypress/e2e/wallet/walletTransaction.cy.js
```

---

## Reporting

Mochawesome reports are generated after test execution.

Report location:

```text
reports/mochawesome
```

The report includes:

- Test execution summary
- Passed and failed test cases
- Error details for failed tests
- HTML report
- JSON report

Cypress screenshots are enabled for test failures.

---

## CI/CD Execution

The project includes a GitHub Actions workflow:

```text
.github/workflows/api-test.yml
```

The workflow:

1. Checks out the repository.
2. Sets up Node.js.
3. Installs dependencies using `npm ci`.
4. Runs the wallet API test suite.
5. Uploads Mochawesome reports as artifacts.

For CI stability, the workflow is configured to use mock mode:

```env
USE_MOCKS=true
```

Required secrets for real API execution:

```text
BASE_URL
USERNAME
PASSWORD
SERVICE_ID
```

---

## Key Files and Responsibilities

| File | Responsibility |
| --- | --- |
| `cypress/e2e/wallet/walletTransaction.cy.js` | Main wallet transaction test scenarios |
| `cypress/support/api/authApi.js` | Login API wrapper |
| `cypress/support/api/userApi.js` | User information API wrapper |
| `cypress/support/api/walletApi.js` | Wallet API wrapper for wallet, transaction, and history endpoints |
| `cypress/support/assertions/transactionAssertions.js` | Reusable transaction and response assertions |
| `cypress/support/assertions/userAssertions.js` | Reusable login and user assertions |
| `cypress/schemas/userSchemas.js` | Login and user response schemas |
| `cypress/schemas/walletSchemas.js` | Wallet and transaction response schemas |
| `cypress/fixtures/transactionData.json` | Positive and negative transaction payloads |
| `cypress/fixtures/mockResponses/walletApiMock.json` | Mock API responses |
| `cypress/support/constants/httpStatus.js` | HTTP status constants |
| `cypress.config.js` | Cypress configuration, environment mapping, reporter setup |
| `.github/workflows/api-test.yml` | CI workflow |

---

## Assumptions

The following assumptions were made during implementation:

- Authentication is used as setup and is not deeply tested.
- A valid user has an associated wallet ID.
- A wallet may contain multiple currency clips.
- Currency values follow ISO 4217 style three-letter currency codes.
- A new currency clip may be created after the first successful credit for a currency.
- Wallet balances must never become negative.
- Debit transactions should be rejected or denied when the balance is insufficient.
- A transaction may be returned as `pending` or `finished`.
- Balance validation is performed only when a transaction is finished.
- If a transaction is pending, the test logs the state instead of failing the balance check immediately.
- Pending transaction timeout after 30 minutes is documented but not automated because it requires time control or delayed backend processing.

---

## Known Limitations

- Real 30-minute pending transaction timeout is not automated.
- Full concurrency testing is not automated.
- Large-scale pagination testing is not automated.
- Performance testing is outside the main Cypress functional API suite.
- The challenge API environment may not always be reachable, so mock mode is provided for stable local and CI execution.

---

## LLM Disclosure

ChatGPT GPT-5.5 was used as an engineering assistant for code review, documentation support, architecture explanation, and mock strategy guidance.

GitHub Copilot in Visual Studio Code was also used to support code development.

AI assistance was used as a productivity and review aid. The final code, documentation, assumptions, and test coverage were reviewed and validated by the author before submission.
