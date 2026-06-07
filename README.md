# Wallet API Cypress Automation Framework

## Overview

This project contains an automated API test suite for the Wallet REST API challenge.

The primary endpoint under test is:

POST /wallet/{walletId}/transaction

The framework also validates supporting wallet functionality such as wallet retrieval, balance validation, transaction lookup, transaction history, schema validation, security checks, and business rules.

The suite is built using Cypress and JavaScript with a layered architecture that separates test logic, API communication, assertions, schemas, and test data.

---

## Technology Stack

- Cypress
- JavaScript
- Mocha / Chai
- AJV
- Mochawesome
- dotenv
- GitHub Actions

---

## Framework Features

- Layered API automation architecture
- Reusable API client classes
- Centralized assertion helpers
- AJV schema validation
- Fixture-driven test data
- Mock mode support
- Real API mode support
- Multi-currency transaction coverage
- Business-rule validation
- Transaction retrieval validation
- Transaction history validation
- Mochawesome reporting
- Failure screenshots
- GitHub Actions CI integration

---

## Development Approach

The framework was developed incrementally using a test-first and iterative approach.

The implementation started with the core transaction flow and gradually evolved through several improvements including:

- Reusable API client classes
- Fixture-driven test data
- AJV schema validation
- Assertion helper classes
- Mock execution support
- Business-rule validation
- Reporting and debugging support
- CI/CD integration

Several refinements were made during development based on issues encountered while testing, including transaction state handling, schema alignment, balance validation logic, and API availability.

The commit history reflects these incremental improvements and design decisions.

---

## Endpoint Coverage

Although the challenge focuses primarily on transaction processing, the framework interacts with all endpoints provided in the API specification.

| Endpoint | Purpose |
|-----------|----------|
| POST /user/login | Authentication setup |
| GET /user/info/{userId} | Retrieve user and wallet information |
| GET /wallet/{walletId} | Wallet validation |
| POST /wallet/{walletId}/transaction | Primary endpoint under test |
| GET /wallet/{walletId}/transaction/{transactionId} | Transaction retrieval validation |
| GET /wallet/{walletId}/transactions | Transaction history validation |

---

## Project Structure

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
---

## Framework Architecture

The framework uses a clean layered structure. Each layer has a separate responsibility.

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
---

## Test Approach

1. Authenticate user.
2. Retrieve user information.
3. Extract wallet ID.
4. Create transactions.
5. Validate response codes.
6. Validate response payloads.
7. Validate schemas.
8. Verify wallet balance changes.
9. Verify transaction retrieval.
10. Verify transaction history.
11. Verify negative scenarios and business rules.

---

## Test Coverage

### Supporting Endpoint Validation

- Login setup
- User information retrieval
- Wallet retrieval

### Functional Coverage

- Credit transaction
- Debit transaction
- Decimal amount transaction
- Multi-currency transaction
- Transaction retrieval
- Transaction history verification

### Business Rule Coverage

- Credit increases balance
- Debit decreases balance
- Negative balance prevention
- Duplicate currency clip prevention
- Denied transaction validation
- Pending transaction handling

### Security Coverage

- Missing Bearer token validation

### Payload Validation

- Negative amount
- Zero amount
- Missing amount
- Unsupported currency
- Invalid transaction type

### Schema Validation

- Login response
- User response
- Wallet response
- Transaction response
- Transaction history response

---

## Mock Mode and Real API Mode

The framework supports two execution modes.

Mock Mode

Use mock mode when the real API is unavailable or when running in CI.

USE_MOCKS=true

In mock mode:

API classes return controlled fixture-based responses.

Wallet mock state is updated in memory.

Balance tests can verify credit and debit behavior.

CI execution is stable and independent of the real environment.

Real API Mode

Use real API mode when testing against the actual challenge API.

USE_MOCKS=false

In real API mode:

API classes call the real endpoints.

The framework uses BASE_URL, USERNAME, PASSWORD, and SERVICE_ID from .env.

Tests validate actual API behavior.

---

## Prerequisites

Node.js 18 or higher

npm

Access to the challenge API, if running in real API mode

Valid credentials, if running in real API mode

Check versions:

node -v
npm -v

---

## Installation

Install dependencies:

npm install

For CI environments, use:

npm ci


---

## Environment Configuration

Copy `.env.example` to `.env` and update the values:

BASE_URL=https://challenge.test.local/challenge/api/v1
USERNAME=test-user
PASSWORD=test-password
SERVICE_ID=test-service-id

- For local mock execution:

USE_MOCKS=true

- For real API execution:

USE_MOCKS=false

---

## Running Tests

Run the wallet API suite:

npm run test:wallet

Run all Cypress tests:

npm test

Run Cypress in interactive mode:

npm run test:open

Run the spec directly:

npx cypress run --spec cypress/e2e/wallet/walletTransaction.cy.js

---

## Reporting

Mochawesome reports are generated after test execution.

Report location:

reports/mochawesome

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

.github/workflows/api-test.yml

The workflow:
    1. Checks out the repository.
    2. Sets up Node.js.
    3. Installs dependencies using npm ci.
    4. Runs the wallet API test suite.
    5. Uploads Mochawesome reports as artifacts.

For CI stability, the workflow is configured to use mock mode:

USE_MOCKS=true

Required secrets for real API execution:

BASE_URL
USERNAME
PASSWORD
SERVICE_ID

---

## Key Files and Responsibilities

cypress/e2e/wallet/walletTransaction.cy.js - Main wallet transaction test scenarios

cypress/support/api/authApi.js - Login API wrapper

cypress/support/api/userApi.js - User information API wrapper

cypress/support/api/walletApi.js - Wallet API wrapper for wallet, transaction, and history endpoints

cypress/support/assertions/transactionAssertions.js - Reusable transaction and response assertions

cypress/support/assertions/userAssertions.js - Reusable login and user assertions

cypress/schemas/userSchemas.js - Login and user response schemas

cypress/schemas/walletSchemas.js - Wallet and transaction response schemas

cypress/fixtures/transactionData.json - Positive and negative transaction payloads

cypress/fixtures/mockResponses/walletApiMock.json - Mock API responses

cypress/support/constants/httpStatus.js - HTTP status constants

cypress.config.js - Cypress configuration, environment mapping, reporter setup

.github/workflows/api-test.yml - CI workflow

---

## Assumptions

1. Authentication is used as setup and is not deeply tested.
2. A valid user has an associated wallet ID.
3. A wallet may contain multiple currency clips.
4. Currency values follow ISO 4217 style three-letter currency codes.
5. A new currency clip may be created after the first successful credit for a currency.
6. Wallet balances must never become negative.
7. Debit transactions should be rejected or denied when the balance is insufficient.
8. A transaction may be returned as pending or finished.
9. Balance validation is performed only when a transaction is finished.
10. If a transaction is pending, the test logs the state instead of failing the balance check immediately.
11. Pending transaction timeout after 30 minutes is documented but not automated because it requires time control or delayed backend processing.


---

## Risks and Mitigations

1.  Transaction Processing Delays

Transactions may remain in a pending state while waiting for external services. Balance validations are performed only after the transaction reaches a final state.

2.  Shared Wallet State

Previous transactions may influence wallet balances and transaction history. Controlled transaction amounts and setup data are used to reduce test dependencies.

3. API Availability

The challenge API was not always accessible during development. Mock mode was implemented to allow local and CI execution without relying on the live environment.

4.  Response Variability

Transaction outcomes may vary depending on processing time. Assertions allow all valid documented response states.

### Secrets Management

GitHub Actions

For CI/CD execution, sensitive values should be stored as GitHub Repository Secrets rather than hardcoded in workflow files.

Required secrets:

- Secret Name	& Description
BASE_URL	Wallet API base URL
USERNAME	API username
PASSWORD	API password
SERVICE_ID	X-Service-Id header value

Secrets can be configured under:

GitHub Repository → Settings → Secrets and Variables → Actions

Example workflow usage:

env:
  BASE_URL: ${{ secrets.BASE_URL }}
  USERNAME: ${{ secrets.USERNAME }}
  PASSWORD: ${{ secrets.PASSWORD }}
  SERVICE_ID: ${{ secrets.SERVICE_ID }}

---

## Known Limitations

- Pending transaction timeout (30 minutes) is not automated.
- Concurrency testing is not automated.
- Large-scale pagination testing is not automated.
- Performance testing is outside the scope of this suite.
- Real API availability cannot be guaranteed.

---

## Summary

This framework focuses on wallet transaction processing as required by the challenge while maintaining a clean, scalable, and maintainable architecture.

Supporting endpoints are used to establish test preconditions and validate transaction outcomes. Schema validation, business-rule assertions, reporting, mock execution support, and CI integration provide additional confidence in the overall solution quality.

---


## LLM Disclosure

AI-assisted tools were used during development as productivity and review aids. All generated suggestions were reviewed, modified, and validated before submission.

### Tools Used

GitHub Copilot - GPT-5 mini - Used inside Visual Studio Code for code completion, refactoring suggestions, repetitive boilerplate generation, and minor documentation assistance. 

GitHub Copilot Chat - Enables use of copilot-debug and copilot commands in the terminal

ChatGPT - GPT-5.5 - Used for code review, framework structure review, documentation support, schema validation discussions, README/TESTPLAN refinement, and architecture explanation. 

### How AI Assistance Was Used

- Improve or refactor and review the Cypress API framework structure.
- Code review, documentation support and mock strategy guidance.


### Author Validation

AI-assisted tools were used as productivity and review aids during development. All code changes, test coverage decisions, schema implementations, business-rule validations, and documentation were designed, implemented, reviewed, and validated by the author.

The commit history reflects the evolution of the framework through iterative development, testing, defect investigation, issue resolution, refactoring, and continuous improvement.