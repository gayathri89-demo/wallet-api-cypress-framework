# Wallet API Automation Framework

## Overview

This project contains an automated API test suite for the Wallet REST API challenge.

The primary focus of the implementation is validating wallet transaction processing through:

```http
POST /wallet/{walletId}/transaction
```

The test suite also verifies wallet balances, transaction retrieval, transaction history, security validations, and key business rules.

The framework is built using Cypress and follows a maintainable structure with reusable API clients, assertions, schemas, fixtures, and reporting.

---

## Technology Stack

* Cypress
* JavaScript
* Mocha / Chai
* AJV Schema Validation
* Mochawesome Reporting
* GitHub Actions

---

## Test Architecture

The framework is designed with a layered structure so that test logic, API calls, assertions, schemas, and test data are separated clearly.

---

## Test Architecture

The framework is designed with a layered structure so that test logic, API calls, assertions, schemas, and test data are separated clearly.

cypress/
├── e2e/
│   └── wallet/
│       └── walletTransaction.cy.js
│
├── support/
│   ├── api/
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   └── walletApi.js
│   │
│   └── assertions/
│       ├── userAssertions.js
│       └── transactionAssertions.js
│
├── schemas/
│   ├── userSchemas.js
│   └── walletSchemas.js
│
└── fixtures/
    ├── transactionData.json
    └── mockResponses/
---

## Test Approach

The test suite follows a realistic user workflow:

1. Authenticate and obtain a Bearer token.
2. Retrieve user information.
3. Obtain the user's wallet ID.
4. Create wallet transactions.
5. Validate API responses and schemas.
6. Verify wallet balance updates.
7. Verify transaction retrieval and transaction history.
8. Validate security and business-rule scenarios.
---

## Prerequisites

* Node.js 18+
* npm
---

Verify installation:

```bash
node -v
npm -v
```

---

## Installation

Install project dependencies:

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
BASE_URL=https://challenge.test.local/challenge/api/v1
USERNAME=your_username
PASSWORD=your_password
SERVICE_ID=your_service_id
USE_MOCKS=false
```

### Mock Mode

For local execution without a live API:

```env
USE_MOCKS=true
```

For real API execution:

```env
USE_MOCKS=false
```

---

## Running Tests

Run the wallet API suite:

```bash
npm run test:wallet
```

Run Cypress directly:

```bash
npx cypress run --spec cypress/e2e/wallet/walletTransaction.cy.js
```

---

## Reporting

Mochawesome reports are generated automatically after execution.

Reports can be found under:

```text
reports/mochawesome
```

The report includes:

* Execution summary
* Passed and failed tests
* Failure screenshots
* Detailed test results

---

## Assumptions

The following assumptions were made during implementation:

* Authentication APIs are trusted and used only for test setup.
* Each user owns a single wallet.
* A wallet may contain multiple currency clips.
* A new currency clip is created after the first successful credit transaction for a currency.
* Wallet balances must never become negative.
* Debit transactions should fail when sufficient balance is unavailable.
* Balance validation is performed only when a transaction is approved.
* Pending transaction processing is documented but not fully automated because it requires controllable asynchronous backend behavior.

---

## CI/CD

The framework supports execution through GitHub Actions.

Required GitHub Secrets:

```text
BASE_URL
USERNAME
PASSWORD
SERVICE_ID
```

Sensitive values should never be committed to source control.

---

## LLM Disclosure

ChatGPT (GPT-5.5) was used for code review assistance, documentation support, and test design discussions.

All implementation details, assumptions, and test coverage decisions were reviewed and validated before submission.
